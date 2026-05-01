import React from 'react';

interface DashboardCardProps {
  titulo: string;
  valor: string;
  icone: React.ReactNode;
  corIcone?: string;
  corFundo?: string;
  variacao?: string;
  variacaoPositiva?: boolean;
  accent?: string;
}

export function DashboardCard({ titulo, valor, icone, variacao, variacaoPositiva, accent = '#00F5D4' }: DashboardCardProps) {
  return (
    <div
      style={{
        background: 'rgba(17,24,39,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: `1px solid rgba(${accent === '#00F5D4' ? '0,245,212' : accent === '#10B981' ? '16,185,129' : '244,63,94'},0.2)`,
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      className="hover:-translate-y-0.5 hover:shadow-lg"
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accent}30`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      {/* Corner glow */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{titulo}</span>
        <div style={{ width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${accent}18`, color: accent, fontSize: '16px', flexShrink: 0 }}>
          {icone}
        </div>
      </div>

      <p style={{ fontSize: '24px', fontWeight: 700, color: '#E2E8F0', lineHeight: 1, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '-0.02em' }}>{valor}</p>

      {variacao && (
        <p style={{ fontSize: '12px', marginTop: '6px', fontWeight: 500, color: variacaoPositiva ? '#10B981' : '#F43F5E', fontFamily: '"JetBrains Mono", monospace' }}>
          {variacao}
        </p>
      )}
    </div>
  );
}
