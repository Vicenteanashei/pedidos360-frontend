import { useState } from 'react';

// Grafico de barras simple de una serie (un solo color), con tooltip al pasar el mouse
export default function BarChart({ data, format = (v) => v, empty = 'Sin datos para este rango.', height = 180 }) {
  const [hover, setHover] = useState(null);
  if (!data.length || data.every((d) => !d.value)) return <p className="muted small">{empty}</p>;
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="bar-chart" style={{ height }} onMouseLeave={() => setHover(null)}>
      {data.map((d, i) => (
        <div key={d.label + i} className="bar-col" onMouseEnter={() => setHover(i)}>
          <div className="bar-area">
            {hover === i && <div className="tooltip"><b>{d.label}</b><br />{format(d.value)}</div>}
            <div className={`bar ${hover === i ? 'hover' : ''}`} style={{ height: `${max ? (d.value / max) * 100 : 0}%` }} />
          </div>
          <div className="bar-label" title={d.label}>{d.short ?? d.label}</div>
        </div>
      ))}
    </div>
  );
}
