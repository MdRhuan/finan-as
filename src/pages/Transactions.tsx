import { useState, useMemo } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';
import { formatarMes } from '../utils/formatDate';
import { filtrarPorMes, filtrarPorCategoria } from '../services/transactionService';
import type { Transacao } from '../types';

function mudarMes(mes: string, delta: number) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="t-page" style={{ margin: 0 }}>Transações</h1>
          <p className="t-label" style={{ marginTop: 4 }}>Histórico de movimentações</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 10px' }}>
          <button onClick={() => setMesSelecionado(mudarMes(mesSelecionado, -1))} style={btnIcon}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 130, textAlign: 'center', textTransform: 'capitalize' }}>{formatarMes(mesSelecionado)}</span>
          <button onClick={() => setMesSelecionado(mudarMes(mesSelecionado, 1))} style={btnIcon}><ChevronRight size={14} /></button>
        </div>
      </div>

      <div className="card">
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input className="input" type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar transações..." style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select className="input" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={{ flex: 1, minWidth: 140 }}>
            <option value="">Todas categorias</option>
            {categorias.map((c) => <option key={c.id} value={c.nome}>{c.icone} {c.nome}</option>)}
          </select>
          <select className="input" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ flex: 1, minWidth: 140 }}>
            <option value="">Todos os tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
          {(filtroCategoria || filtroTipo || busca) && (
            <button className="btn-secondary" onClick={() => { setFiltroCategoria(''); setFiltroTipo(''); setBusca(''); }}>Limpar</button>
          )}
        </div>
      </div>

      <div className="card">
        <p className="t-label" style={{ marginBottom: 12 }}>{filtradas.length} transações</p>
        <TransactionList transacoes={filtradas} onEditar={handleEditar} onExcluir={handleExcluir} />
      </div>

      <button
        onClick={() => setFormAberto(true)}
        className="btn-primary fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30"
        style={{ width: 56, height: 56, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
      >
        <Plus size={22} />
      </button>

      {formAberto && <TransactionForm transacao={editando} onFechar={fecharForm} />}
    </div>
  );
}

const btnIcon: React.CSSProperties = { padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text)' };
