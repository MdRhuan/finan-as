import { Pencil, Trash2 } from 'lucide-react';
import type { Transacao } from '../types';
import { formatarMoeda } from '../utils/formatCurrency';
import { formatarData } from '../utils/formatDate';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  transacoes: Transacao[];
  onEditar?: (t: Transacao) => void;
  onExcluir?: (id: string) => void;
  limite?: number;
}

export function TransactionList({ transacoes, onEditar, onExcluir, limite }: Props) {
  const lista = limite ? transacoes.slice(0, limite) : transacoes;

  if (lista.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria'].map((h) => (
              <th key={h} className="t-th" style={{ textAlign: h === 'Valor' ? 'right' : 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
            {(onEditar || onExcluir) && <th style={{ borderBottom: '1px solid var(--border)' }} />}
          </tr>
        </thead>
        <tbody>
          {lista.map((t) => {
            const positivo = t.tipo === 'receita';
            return (
              <tr key={t.id} className="group" style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontSize: 13, color: 'var(--text)' }}>{formatarData(t.data)}</td>
                <td style={{ padding: '12px', fontSize: 14, color: 'var(--text)' }}>{t.descricao}</td>
                <td style={{ padding: '12px', fontSize: 14, fontWeight: 600, textAlign: 'right', color: positivo ? 'var(--pos)' : 'var(--neg)' }}>
                  {positivo ? '+' : '−'}{formatarMoeda(t.valor)}
                </td>
                <td style={{ padding: '12px' }}>
                  <span className={positivo ? 'badge badge-receita' : 'badge badge-despesa'}>
                    {positivo ? 'receita' : 'despesa'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <CategoryBadge categoria={t.categoria} />
                </td>
                {(onEditar || onExcluir) && (
                  <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEditar && <button onClick={() => onEditar(t)} style={iconBtn} title="Editar"><Pencil size={13} /></button>}
                      {onExcluir && <button onClick={() => onExcluir(t.id)} style={iconBtn} title="Excluir"><Trash2 size={13} /></button>}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  padding: 6, borderRadius: 6, border: '1px solid var(--border)',
  background: 'var(--card)', cursor: 'pointer', color: 'var(--text)', marginLeft: 4,
};
