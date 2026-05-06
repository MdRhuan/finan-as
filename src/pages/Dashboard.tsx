import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { useStore } from '../store/useStore';
import { DashboardCard } from '../components/DashboardCard';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';
import { formatarMoeda } from '../utils/formatCurrency';
import { formatarMes } from '../utils/formatDate';
import { filtrarPorMes, calcularSaldo, calcularTotalPorTipo, gerarResumoMeses, transacoesValidas } from '../services/transactionService';
import type { Transacao } from '../types';

function mudarMes(mes: string, delta: number) {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(a, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function Dashboard() {
  const { transacoes, mesSelecionado, setMesSelecionado, excluirTransacao } = useStore();
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Transacao | undefined>();

  const validas = transacoesValidas(transacoes);
  const doMes = filtrarPorMes(validas, mesSelecionado);
  const saldo = calcularSaldo(validas);
  const receitas = calcularTotalPorTipo(doMes, 'receita');
  const despesas = calcularTotalPorTipo(doMes, 'despesa');

  const dadosBarras = gerarResumoMeses(validas, 6).map((r) => ({
    mes: r.mes.slice(5),
    saldo: r.receitas - r.despesas,
    ativo: r.mes === mesSelecionado,
  }));

  const handleEditar = (t: Transacao) => { setEditando(t); setFormAberto(true); };
  const fecharForm = () => { setFormAberto(false); setEditando(undefined); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="t-hero" style={{ margin: 0 }}>Dashboard</h1>
          <p className="t-label" style={{ marginTop: 4 }}>Visão geral das finanças</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 10px' }}>
          <button onClick={() => setMesSelecionado(mudarMes(mesSelecionado, -1))} style={btnIcon}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 130, textAlign: 'center', textTransform: 'capitalize' }}>{formatarMes(mesSelecionado)}</span>
          <button onClick={() => setMesSelecionado(mudarMes(mesSelecionado, 1))} style={btnIcon}><ChevronRight size={14} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <DashboardCard titulo="Saldo total" valor={formatarMoeda(saldo)} feature />
        <DashboardCard titulo="Receitas do mês" valor={formatarMoeda(receitas)} cor="var(--pos)" />
        <DashboardCard titulo="Despesas do mês" valor={formatarMoeda(despesas)} cor="var(--neg)" />
      </div>

      <div className="card">
        <h2 className="t-section" style={{ margin: 0, marginBottom: 16 }}>Saldo por mês</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dadosBarras}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={48} />
            <Tooltip formatter={(v) => formatarMoeda(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: '#fff' }} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="saldo" radius={[6, 6, 0, 0]}>
              {dadosBarras.map((d, i) => (
                <Cell key={i} fill={d.ativo ? 'var(--bar-active)' : 'var(--bar-inactive)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="t-section" style={{ margin: 0, marginBottom: 12 }}>Últimas transações</h2>
        <TransactionList transacoes={doMes} onEditar={handleEditar} onExcluir={excluirTransacao} limite={20} />
      </div>

      <button
        onClick={() => setFormAberto(true)}
        className="btn-primary fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30"
        style={{ width: 56, height: 56, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        title="Nova transação"
      >
        <Plus size={22} />
      </button>

      {formAberto && <TransactionForm transacao={editando} onFechar={fecharForm} />}
    </div>
  );
}

const btnIcon: React.CSSProperties = { padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text)' };
