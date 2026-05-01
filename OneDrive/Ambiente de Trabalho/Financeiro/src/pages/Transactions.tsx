import { useState, useMemo } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';
import { formatarMes } from '../utils/formatDate';
import { filtrarPorMes, filtrarPorCategoria } from '../services/transactionService';
import type { Transacao } from '../types';

const card: React.CSSProperties = {
  background: 'rgba(17,24,39,0.7)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid #1E2D40',
  padding: '20px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
};

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

function mudarMes(mes: string, delta: number): string {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(a, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function Transactions() {
  const { transacoes, categorias, mesSelecionado, setMesSelecionado, excluirTransacao } = useStore();
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Transacao | undefined>();
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busca, setBusca] = useState('');

  const filtradas = useMemo(() => {
    let lista = filtrarPorMes(transacoes, mesSelecionado);
    if (filtroCategoria) lista = filtrarPorCategoria(lista, filtroCategoria);
    if (filtroTipo) lista = lista.filter((t) => t.tipo === filtroTipo);
    if (busca) lista = lista.filter((t) => t.descricao.toLowerCase().includes(busca.toLowerCase()));
    return lista.sort((a, b) => b.data.localeCompare(a.data));
  }, [transacoes, mesSelecionado, filtroCategoria, filtroTipo, busca]);

  const handleEditar = (t: Transacao) => { setEditando(t); setFormAberto(true); };
  const fecharForm = () => { setFormAberto(false); setEditando(undefined); };
  const handleExcluir = (id: string) => { if (confirm('Excluir esta transação?')) excluirTransacao(id); };

  const isMesMinimo = mesSelecionado <= '2026-04';

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    (e.target as HTMLElement).style.borderColor = '#00F5D4';
    (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(0,245,212,0.1)';
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    (e.target as HTMLElement).style.borderColor = '#1E2D40';
    (e.target as HTMLElement).style.boxShadow = 'none';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#E2E8F0', margin: 0, letterSpacing: '-0.03em' }}>Transações</h1>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontFamily: '"JetBrains Mono", monospace' }}>histórico de movimentações</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#0D1220', border: '1px solid #1E2D40', borderRadius: '12px', padding: '6px 10px' }}>
          <button
            onClick={() => { const ant = mudarMes(mesSelecionado, -1); if (ant >= '2026-04') setMesSelecionado(ant); }}
            disabled={isMesMinimo}
            style={{ padding: '4px', borderRadius: '6px', border: 'none', background: 'none', cursor: isMesMinimo ? 'default' : 'pointer', color: isMesMinimo ? '#334155' : '#64748B' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', minWidth: '120px', textAlign: 'center', textTransform: 'capitalize' }}>
            {formatarMes(mesSelecionado)}
          </span>
          <button onClick={() => setMesSelecionado(mudarMes(mesSelecionado, 1))} style={{ padding: '4px', borderRadius: '6px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={card}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar transações..."
            style={{ ...inputStyle, paddingLeft: '36px' }}
            onFocus={focusInput} onBlur={blurInput}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '128px' }} onFocus={focusInput} onBlur={blurInput}>
            <option value="">Todas categorias</option>
            {categorias.map((c) => <option key={c.id} value={c.nome}>{c.icone} {c.nome}</option>)}
          </select>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '112px' }} onFocus={focusInput} onBlur={blurInput}>
            <option value="">Todos os tipos</option>
            <option value="receita">↑ Receitas</option>
            <option value="despesa">↓ Despesas</option>
          </select>
          {(filtroCategoria || filtroTipo || busca) && (
            <button
              onClick={() => { setFiltroCategoria(''); setFiltroTipo(''); setBusca(''); }}
              style={{ padding: '10px 14px', fontSize: '13px', color: '#64748B', border: '1px solid #1E2D40', borderRadius: '10px', backgroundColor: '#080C14', cursor: 'pointer', fontFamily: '"Space Grotesk", system-ui' }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#475569', fontFamily: '"JetBrains Mono", monospace' }}>
            <span style={{ fontWeight: 700, color: '#00F5D4' }}>{filtradas.length}</span> transações
          </p>
        </div>
        <TransactionList transacoes={filtradas} onEditar={handleEditar} onExcluir={handleExcluir} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setFormAberto(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 btn-neon animate-glow"
        style={{ width: 56, height: 56, borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#080C14' }}
      >
        <Plus size={24} />
      </button>

      {formAberto && <TransactionForm transacao={editando} onFechar={fecharForm} />}
    </div>
  );
}
