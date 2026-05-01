import { Pencil, Trash2 } from 'lucide-react';
import type { Transacao } from '../types';
import { formatarMoeda } from '../utils/formatCurrency';
import { formatarDataCurta } from '../utils/formatDate';
import { CategoryBadge } from './CategoryBadge';

interface TransactionListProps {
  transacoes: Transacao[];
  onEditar?: (t: Transacao) => void;
  onExcluir?: (id: string) => void;
  limite?: number;
}

export function TransactionList({ transacoes, onEditar, onExcluir, limite }: TransactionListProps) {
  const lista = limite ? transacoes.slice(0, limite) : transacoes;

  if (lista.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontSize: '32px', marginBottom: '8px' }}>💸</p>
        <p style={{ color: '#475569', fontSize: '14px' }}>Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div>
      {lista.map((t, i) => (
        <div
          key={t.id}
          className="group"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 0',
            borderBottom: i < lista.length - 1 ? '1px solid #1E2D40' : 'none',
            transition: 'background 0.15s',
          }}
        >
          {/* Icon */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700,
            flexShrink: 0,
            backgroundColor: t.tipo === 'receita' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
            color: t.tipo === 'receita' ? '#10B981' : '#F43F5E',
            border: `1px solid ${t.tipo === 'receita' ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
          }}>
            {t.tipo === 'receita' ? '↑' : '↓'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#CBD5E1' }} className="truncate">{t.descricao}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '11px', color: '#475569', fontFamily: '"JetBrains Mono", monospace' }}>{formatarDataCurta(t.data)}</span>
              <CategoryBadge categoria={t.categoria} size="sm" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{
              fontWeight: 700,
              fontSize: '14px',
              fontFamily: '"JetBrains Mono", monospace',
              color: t.tipo === 'receita' ? '#10B981' : '#F43F5E',
              letterSpacing: '-0.02em',
            }}>
              {t.tipo === 'despesa' ? '−' : '+'}{formatarMoeda(t.valor)}
            </span>

            {(onEditar || onExcluir) && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEditar && (
                  <button
                    onClick={() => onEditar(t)}
                    style={{ padding: '5px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#475569', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,245,212,0.1)'; (e.currentTarget as HTMLElement).style.color = '#00F5D4'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                  >
                    <Pencil size={13} />
                  </button>
                )}
                {onExcluir && (
                  <button
                    onClick={() => onExcluir(t.id)}
                    style={{ padding: '5px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#475569', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(244,63,94,0.15)'; (e.currentTarget as HTMLElement).style.color = '#F43F5E'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
