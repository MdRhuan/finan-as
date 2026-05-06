import { useState } from 'react';
import { X } from 'lucide-react';
import type { Transacao, TipoTransacao } from '../types';
import { useStore } from '../store/useStore';
import { dataHoje } from '../utils/formatDate';
import { DateInput } from './DateInput';

interface Props { transacao?: Transacao; onFechar: () => void; }

export function TransactionForm({ transacao, onFechar }: Props) {
  const { categorias, adicionarTransacao, editarTransacao } = useStore();

  const [tipo, setTipo] = useState<TipoTransacao>(transacao?.tipo || 'despesa');
  const [valor, setValor] = useState(transacao ? String(transacao.valor) : '');
  const [descricao, setDescricao] = useState(transacao?.descricao || '');
  const [categoria, setCategoria] = useState(transacao?.categoria || categorias[0]?.nome || '');
  const [data, setData] = useState(transacao?.data || dataHoje());
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(valor.replace(',', '.'));
    if (!v || v <= 0) return setErro('Valor inválido');
    if (!descricao.trim()) return setErro('Informe a descrição');
    if (!categoria) return setErro('Selecione uma categoria');
    if (!data) return setErro('Informe a data');
    const dados = { tipo, valor: v, descricao: descricao.trim(), categoria, data };
    if (transacao) editarTransacao(transacao.id, dados);
    else adicionarTransacao(dados);
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ padding: 16 }}>
      <div className="absolute inset-0" style={{ background: 'rgba(17,17,17,0.4)' }} onClick={onFechar} />
      <div className="relative animate-slide-up card" style={{ width: '100%', maxWidth: 440, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 className="t-page" style={{ margin: 0 }}>{transacao ? 'Editar transação' : 'Nova transação'}</h2>
          <button onClick={onFechar} style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', background: '#F4F4F2', borderRadius: 8, padding: 4, marginBottom: 16 }}>
          {(['despesa', 'receita'] as TipoTransacao[]).map((t) => (
            <button key={t} type="button" onClick={() => setTipo(t)}
              style={{
                flex: 1, padding: 8, borderRadius: 6, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 14,
                background: tipo === t ? 'var(--card)' : 'transparent',
                color: tipo === t ? (t === 'receita' ? 'var(--pos)' : 'var(--neg)') : 'var(--muted)',
                boxShadow: tipo === t ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {t === 'receita' ? 'Receita' : 'Despesa'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Valor (R$)">
            <input className="input" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" autoFocus
              style={{ fontSize: 22, fontWeight: 700, color: tipo === 'receita' ? 'var(--pos)' : 'var(--neg)' }} />
          </Field>
          <Field label="Descrição">
            <input className="input" type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Mercado, Uber..." />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Categoria">
              <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {categorias.map((c) => <option key={c.id} value={c.nome}>{c.icone} {c.nome}</option>)}
              </select>
            </Field>
            <Field label="Data">
              <DateInput value={data} onChange={setData} />
            </Field>
          </div>

          {erro && <p style={{ color: 'var(--neg)', fontSize: 13, margin: 0 }}>{erro}</p>}

          <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
            {transacao ? 'Salvar' : 'Adicionar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="t-label" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
