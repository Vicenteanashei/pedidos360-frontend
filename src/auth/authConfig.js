const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID;
const spaClientId = import.meta.env.VITE_SPA_CLIENT_ID;
const apiClientId = import.meta.env.VITE_API_CLIENT_ID;
const validId = value => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value || '') && value !== '00000000-0000-0000-0000-000000000000';
export const identityConfigured = [tenantId, spaClientId, apiClientId].every(validId);
// Placeholders keep the configuration screen renderable. Login is disabled until configured.
export const msalConfig = { auth: {
 clientId: spaClientId || '00000000-0000-0000-0000-000000000000',
 authority: `https://login.microsoftonline.com/${tenantId || 'organizations'}`,
 redirectUri: `${window.location.origin}/redirect.html`, postLogoutRedirectUri: window.location.origin,
}, cache: {cacheLocation:'sessionStorage'} };
export const tokenRequest = {scopes: [`api://${apiClientId || 'configure-api'}/access_as_user`]};
