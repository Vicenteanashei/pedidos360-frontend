#!/usr/bin/env bash
# Construye el frontend y lo publica en el bucket S3 detrás de CloudFront.
# Ejecutar en AWS CloudShell o en la terminal del Learner Lab (requiere AWS CLI y Node 20+ o Docker):
#   bash scripts/deploy-s3.sh <nombre-del-stack-frontend> [infra/.env]
# El stack es el creado con infra/aws/frontend-s3-cloudfront.json.
set -euo pipefail
stack="${1:-}"
[[ -n "$stack" ]] || { echo 'Uso: bash scripts/deploy-s3.sh <stack-frontend> [archivo.env]' >&2; exit 2; }
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
env_file="${2:-infra/.env}"
[[ -f "$env_file" ]] || { echo "Falta $env_file con ENTRA_TENANT_ID, SPA_CLIENT_ID, API_CLIENT_ID y PUBLIC_API_URL." >&2; exit 2; }

# Solo identificadores públicos: todo VITE_* termina dentro del JavaScript del navegador.
set -a
# shellcheck source=/dev/null
source "$env_file"
set +a
for var in ENTRA_TENANT_ID SPA_CLIENT_ID API_CLIENT_ID PUBLIC_API_URL; do
  [[ -n "${!var:-}" ]] || { echo "Falta $var en $env_file" >&2; exit 2; }
done
[[ "$PUBLIC_API_URL" =~ ^https://[A-Za-z0-9.-]+(/[A-Za-z0-9._/-]*)?$ ]] || {
  echo 'PUBLIC_API_URL debe ser la URL HTTPS del API Gateway (salida ApiUrl).' >&2; exit 2; }

output() {
  aws cloudformation describe-stacks --stack-name "$stack" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text
}
bucket="$(output BucketName)"
distribution="$(output DistributionId)"
url="$(output FrontendUrl)"
[[ -n "$bucket" && "$bucket" != None && -n "$distribution" && "$distribution" != None ]] || {
  echo "El stack $stack no tiene las salidas BucketName/DistributionId." >&2; exit 2; }

export VITE_ENTRA_TENANT_ID="$ENTRA_TENANT_ID" VITE_SPA_CLIENT_ID="$SPA_CLIENT_ID" \
  VITE_API_CLIENT_ID="$API_CLIENT_ID" VITE_API_BASE_URL="$PUBLIC_API_URL" \
  VITE_DIAGNOSTICS="${VITE_DIAGNOSTICS:-false}"

rm -rf dist
if command -v npm >/dev/null && [[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ]]; then
  npm ci --no-audit --no-fund
  npm run build
else
  echo 'Node 20+ no disponible: se construye con Docker (etapa build del Dockerfile).'
  docker build --target build \
    --build-arg VITE_ENTRA_TENANT_ID --build-arg VITE_SPA_CLIENT_ID --build-arg VITE_API_CLIENT_ID \
    --build-arg VITE_API_BASE_URL --build-arg VITE_DIAGNOSTICS -t pedidos360-front-build .
  container="$(docker create pedidos360-front-build)"
  docker cp "$container:/app/dist" dist
  docker rm "$container" >/dev/null
fi
[[ -f dist/index.html && -f dist/redirect.html ]] || { echo 'El build no generó index.html y redirect.html.' >&2; exit 1; }

# Assets con hash en el nombre: caché larga. HTML: siempre se revalida para tomar el build nuevo.
aws s3 sync dist/assets "s3://$bucket/assets" --delete --cache-control 'public,max-age=31536000,immutable'
for page in index.html redirect.html; do
  aws s3 cp "dist/$page" "s3://$bucket/$page" --cache-control 'no-cache' --content-type 'text/html; charset=utf-8'
done
aws cloudfront create-invalidation --distribution-id "$distribution" --paths '/' '/index.html' '/redirect.html' \
  --query 'Invalidation.Id' --output text >/dev/null

printf 'Frontend publicado en %s\nRegistrar en Entra (SPA): %s/redirect.html\n' "$url" "$url"
