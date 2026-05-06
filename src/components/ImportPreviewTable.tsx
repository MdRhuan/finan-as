import { AlertCircle } from 'lucide-react';
import type { PreviewImportacao } from '../types';
import { formatarMoeda } from '../utils/formatCurrency';
import { useStore } from '../store/useStore';
import { DateInput } from './DateInput';

interface Props {
  preview: PreviewImportacao[];
  onChange: (p: PreviewImportacao[]) => void;
}

export function ImportPreviewTable({ preview, onChange }: Props) {
  const categorias = useStore((s) => s.categorias);

  const toggle = (i: number) => {
    const novo = [...preview];
    novo[i] = { ...novo[i], selecionada: !novo[i].selecionada };
    onChange(novo);
  };
  const toggleAll = (v: boolean) => onChange(preview.map((p) => ({ ...p, selecionada: p.erro ? false : v })));
  const setCampo = <K extends keyof PreviewImportacao>(i: number, k: K, v: PreviewImportacao[K]) => {
    const novo = [...preview];
    novo[i] = { ...novo[i], [k]: v };
    onChange(novo);
  };

  const sel = preview.filter((p) => p.selecionada).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="t-label" style={{ margin: 0 }}><b style={{ color: 'var(--text)' }}>{sel}</b> de {preview.length} selecionadas</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => toggleAll(true)} style={linkBtn}>Selecionar todas</button>
          <span style={{ color: 'var(--border)' }}>|</span>
          <button onClick={() => toggleAll(false)} style={linkBtn}>Desmarcar</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ width: 30, padding: 10 }}></th>
              {['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'].map((h, i) => (
                <th key={h} className="t-th" style={{ padding: 10, textAlign: i === 4 ? 'right' : 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)', opacity: p.erro ? 0.6 : 1 }}>
                <td style={{ padding: 8 }}>
                  <input type="checkbox" checked={p.selecionada} disabled={!!p.erro} onChange={() => toggle(i)} />
                </td>
                <td style={{ padding: 6 }}>
                  <DateInput value={p.data} onChange={(v) => setCampo(i, 'data', v)} className="input" style={{ padding: '4px 8px', fontSize: 12 }} />
                </td>
                <td style={{ padding: 6 }}>
                  <input className="input" value={p.descricao} onChange={(e) => setCampo(i, 'descricao', e.target.value)} style={{ padding: '4px 8px', fontSize: 12 }} />
                  {p.erro && <div style={{ display: 'flex', gap: 4, marginTop: 4, fontSize: 11, color: 'var(--neg)' }}><AlertCircle size={11} />{p.erro}</div>}
                </td>
                <td style={{ padding: 6 }}>
                  <select className="input" value={p.categoria} onChange={(e) => setCampo(i, 'categoria', e.target.value)} style={{ padding: '4px 8px', fontSize: 12 }}>
                    {categorias.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </td>
                <td style={{ padding: 6 }}>
                  <select className="input" value={p.tipo} onChange={(e) => setCampo(i, 'tipo', e.target.value as 'receita' | 'despesa')}
                    style={{ padding: '4px 8px', fontSize: 12, color: p.tipo === 'receita' ? 'var(--pos)' : 'var(--neg)' }}>
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                </td>
                <td style={{ padding: 10, textAlign: 'right', fontWeight: 600, color: p.tipo === 'receita' ? 'var(--pos)' : 'var(--neg)' }}>
                  {formatarMoeda(p.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = { fontSize: 12, color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 };
