import { useState } from 'react';
import { X } from 'lucide-react';
import type { Transacao, TipoTransacao } from '../types';
import { useStore } from '../store/useStore';
import { dataHoje } from '../utils/formatDate';

interface TransactionFormProps {
  transacao?: Transacao;
  onFechar: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #1E2D40',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#E2E8F0',
  backgroundColor: '#080C14',
  outline: 'none',
  fontFamily: '"Space Grotesk", system-ui, sans-serif',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontFamily: '"JetBrains Mono", monospace',
};

export function TransactionForm({ transacao, onFechar }: TransactionFormProps) {
  const { categorias, adicionarTransacao, editarTransacao, contas } = useStore();

  const [tipo, setTipo] = useState<TipoTransacao>(transacao?.tipo || 'despesa');
  const [valor, setValor] = useState(transacao ? String(transacao.valor) : '');
  const [descricao, setDescricao] = useState(transacao?.descricao || '');
  const [categoria, setCategoria] = useState(
    transacao?.categoria || (categorias.length > 0 ? (transacao?.tipo === 'receita' ? 'Salário' : categorias[0].nome) : '')
  );
  const [data, setData] = useState(transacao?.data || dataHoje());
  const [conta, setConta] = useState(transacao?.conta || '');
  const [erro, setErro] = useState('');

  const handleChangeTipo = (t: TipoTransacao) => {
    setTipo(t);
    setCategoria(t === 'receita' ? 'Salário' : (categorias[0]?.nome || ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const v = parseFloat(valor.replace(',', '.'));
    if (!v || isNaN(v) || v <= 0) { setErro('Informe um valor válido'); return; }
    if (!descricao.trim()) { setErro('Informe a descrição'); return; }
    if (!categoria) { setErro('Selecione uma categoria'); return; }
    if (!data) { setErro('Informe a data'); return; }

    const dados = { tipo, valor: v, descricao: descricao.trim(), categoria, data, conta: conta || undefined };
    if (transacao) { editarTransacao(transacao.id, dados); } else { adicionarTransacao(dados); }
    onFechar();
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    (e.target as HTMLElement).style.borderColor = '#00F5D4';
    (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(0,245,212,0.1)';
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    (e.target as HTMLElement).style.borderColor = '#1E2D40';
    (e.target as HTMLElement).style.boxShadow = 'none';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onFechar} />
      <div
        className="relative animate-slide-up w-full max-w-md"
        style={{
          background: 'rgba(13,18,32,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid #1E2D40',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,245,212,0.08)',
          padding: '24px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#E2E8F0', margin: 0, letterSpacing: '-0.02em' }}>
              {transacao ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            <div style={{ width: 32, height: 2, background: 'linear-gradient(90deg, #00F5D4, transparent)', marginTop: '6px', borderRadius: '1px' }} />
          </div>
          <button
            onClick={onFechar}
            style={{ padding: '6px', borderRadius: '8px', color: '#475569', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(244,63,94,0.1)'; (e.currentTarget as HTMLElement).style.color = '#F43F5E'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tipo toggle */}
        <div style={{ display: 'flex', backgroundColor: '#080C14', borderRadius: '12px', padding: '4px', marginBottom: '20px', border: '1px solid #1E2D40' }}>
          {(['despesa', 'receita'] as TipoTransacao[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleChangeTipo(t)}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: 700,
                transition: 'all 0.2s',
                backgroundColor: tipo === t
                  ? t === 'receita' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'
                  : 'transparent',
                color: tipo === t
                  ? t === 'receita' ? '#10B981' : '#F43F5E'
                  : '#475569',
                border: tipo === t
                  ? `1px solid ${t === 'receita' ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`
                  : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {t === 'receita' ? '↑ Receita' : '↓ Despesa'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Valor (R$)</label>
            <input
              type="number" step="0.01" min="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              style={{ ...inputStyle, marginTop: '6px', fontSize: '28px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: tipo === 'receita' ? '#10B981' : '#F43F5E' }}
              onFocus={focusStyle} onBlur={blurStyle}
              autoFocus
            />
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Supermercado, Uber..."
              style={{ ...inputStyle, marginTop: '6px' }}
              onFocus={focusStyle} onBlur={blurStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                style={{ ...inputStyle, marginTop: '6px' }}
                onFocus={focusStyle} onBlur={blurStyle}
              >
                <option value="">Selecione</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.nome}>{c.icone} {c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                style={{ ...inputStyle, marginTop: '6px' }}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>
          </div>

          {contas.length > 0 && (
            <div>
              <label style={labelStyle}>Conta (opcional)</label>
              <select
                value={conta}
                onChange={(e) => setConta(e.target.value)}
                style={{ ...inputStyle, marginTop: '6px' }}
                onFocus={focusStyle} onBlur={blurStyle}
              >
                <option value="">Nenhuma</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
          )}

          {erro && (
            <p style={{ fontSize: '13px', color: '#F43F5E', fontWeight: 500, padding: '8px 12px', backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.2)' }}>
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="btn-neon"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '15px', fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            {transacao ? 'Salvar alterações' : 'Adicionar transação'}
          </button>
        </form>
      </div>
    </div>
  );
}
