import React from 'react';

interface Props {
  titulo: string;
  valor: string;
  icone?: React.ReactNode;
  feature?: boolean;
  cor?: string;
}

export function DashboardCard({ titulo, valor, icone, feature, cor }: Props) {
  return (
    <div className={feature ? 'card-feature' : 'card'} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="t-label" style={{ color: feature ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>{titulo}</span>
        {icone && (
          <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: feature ? 'rgba(255,255,255,0.1)' : '#F4F4F2', color: feature ? '#fff' : 'var(--text)' }}>
            {icone}
          </span>
        )}
      </div>
      <p style={{ fontSize: 26, fontWeight: 700, margin: 0, color: cor || (feature ? '#fff' : 'var(--text)'), letterSpacing: '-0.02em' }}>{valor}</p>
    </div>
  );
}
