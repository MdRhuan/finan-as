import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useStore } from '../store/useStore';
import { DashboardCard } from '../components/DashboardCard';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';
import { formatarMoeda } from '../utils/formatCurrency';
import { formatarMes } from '../utils/formatDate';
import { filtrarPorMes, calcularSaldo, calcularTotalPorTipo, calcularPorCategoria, gerarResumoMeses, transacoesValidas } from '../services/transactionService';
import { useNavigate } from 'react-router-dom';
import type { Transacao } from '../types';

const card: React.CSSProperties = {
  background: 'rgba(17,24,39,0.7)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid #1E2D40',
  padding: '20px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
};

function mudarMes(mes: string, delta: number): string {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(a, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const tooltipStyle = {
  borderRadius: '10px',
  border: '1px solid #1E2D40',
  fontSize: 12,
  backgroundColor: '#0D1220',
  color: '#E2E8F0',
};

export function Dashboard() {
  const { transacoes, categorias, metas, mesSelecionado, setMesSelecionado, excluirTransacao } = useStore();
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Transacao | undefined>();
  const navigate = useNavigate();

  const metaMaisProxima = metas
    .filter((m) => !m.concluida)
    .sort((a, b) => (b.valorAtual / b.valorAlvo) - (a.valorAtual / a.valorAlvo))[0] ?? null;

  const validas = transacoesValidas(transacoes);
  const doMes = filtrarPorMes(validas, mesSelecionado);
  const saldo = calcularSaldo(validas);
  const receitas = calcularTotalPorTipo(doMes, 'receita');
  const despesas = calcularTotalPorTipo(doMes, 'despesa');
  const porCategoria = calcularPorCategoria(doMes);

  const dadosComparativo = gerarResumoMeses(validas, 6).map((r) => ({
    mes: r.mes.slice(5),
    Receitas: r.receitas,
    Despesas: r.despesas,
  }));

  const dadosPizza = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([nome, valor]) => {
      const cat = categorias.find((c) => c.nome === nome);
      return { nome, valor, cor: cat?.cor || '#475569' };
    });

  const handleEditar = (t: Transacao) => { setEditando(t); setFormAberto(true); };
  const fecharForm = () => { setFormAberto(false); setEditando(undefined); };

  const isMesMinimo = mesSelecionado <= '2026-04';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#E2E8F0', margin: 0, letterSpacing: '-0.03em' }}>Dashboard</h1>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontFamily: '"JetBrains Mono", monospace' }}>visão geral das finanças</p>
        </div>
        {/* Month picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#0D1220', border: '1px solid #1E2D40', borderRadius: '12px', padding: '6px 10px' }}>
          <button
            onClick={() => { const ant = mudarMes(mesSelecionado, -1); if (ant >= '2026-04') setMesSelecionado(ant); }}
            disabled={isMesMinimo}
            style={{ padding: '4px', borderRadius: '6px', border: 'none', background: 'none', cursor: isMesMinimo ? 'default' : 'pointer', color: isMesMinimo ? '#334155' : '#64748B', transition: 'color 0.15s' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', minWidth: '120px', textAlign: 'center', textTransform: 'capitalize' }}>
            {formatarMes(mesSelecionado)}
          </span>
          <button
            onClick={() => setMesSelecionado(mudarMes(mesSelecionado, 1))}
            style={{ padding: '4px', borderRadius: '6px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', transition: 'color 0.15s' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <DashboardCard titulo="Saldo Total" valor={formatarMoeda(saldo)} icone="💳" accent="#00F5D4" variacaoPositiva={saldo >= 0} />
        <DashboardCard titulo="Receitas do Mês" valor={formatarMoeda(receitas)} icone="↑" accent="#10B981" variacaoPositiva={true} />
        <DashboardCard titulo="Despesas do Mês" valor={formatarMoeda(despesas)} icone="↓" accent="#F43F5E" variacaoPositiva={false} />
      </div>

      {/* Comparativo */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', margin: 0, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Entradas x Gastos</h2>
          <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#475569', fontFamily: '"JetBrains Mono", monospace' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981' }} />Receitas
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F43F5E', display: 'inline-block', boxShadow: '0 0 6px #F43F5E' }} />Despesas
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dadosComparativo} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D40" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#475569', fontFamily: '"JetBrains Mono", monospace' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#475569', fontFamily: '"JetBrains Mono", monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={42} />
            <Tooltip formatter={(v, name) => [formatarMoeda(Number(v)), name]} contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill="#F43F5E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Últimas transações */}
      <div style={card}>
        <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Últimas Transações</h2>
        <TransactionList transacoes={doMes} onEditar={handleEditar} onExcluir={excluirTransacao} limite={20} />
      </div>

      {/* Despesas por Categoria + Meta Mais Próxima */}
      <div style={{ display: 'grid', gridTemplateColumns: metaMaisProxima ? '1fr 1fr' : '1fr', gap: '14px', alignItems: 'stretch' }}>
        {/* Pizza */}
        <div style={card}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '16px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Despesas por Categoria</h2>
          {dadosPizza.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
              Nenhuma despesa no mês
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={dadosPizza} dataKey="valor" cx="50%" cy="50%" outerRadius={55} innerRadius={32} strokeWidth={0}>
                    {dadosPizza.map((d, i) => <Cell key={i} fill={d.cor} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatarMoeda(Number(v))} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dadosPizza.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: d.cor, flexShrink: 0, boxShadow: `0 0 5px ${d.cor}` }} />
                      <span style={{ fontSize: '11px', color: '#64748B', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nome}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: '#CBD5E1' }}>{formatarMoeda(d.valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Meta mais próxima */}
        {metaMaisProxima && (() => {
          const pct = Math.min((metaMaisProxima.valorAtual / metaMaisProxima.valorAlvo) * 100, 100);
          const falta = metaMaisProxima.valorAlvo - metaMaisProxima.valorAtual;
          return (
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', margin: 0, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Meta Mais Próxima</h2>
                <button onClick={() => navigate('/metas')} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#00F5D4', background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace' }}>
                  Ver todas <ArrowRight size={11} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0, backgroundColor: metaMaisProxima.cor + '20', border: `1px solid ${metaMaisProxima.cor}30` }}>
                  {metaMaisProxima.icone}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{metaMaisProxima.nome}</span>
                  <span style={{ fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', color: '#475569' }}>
                    {formatarMoeda(metaMaisProxima.valorAtual)} / {formatarMoeda(metaMaisProxima.valorAlvo)}
                  </span>
                </div>
                <span style={{ fontSize: '20px', fontWeight: 700, flexShrink: 0, color: metaMaisProxima.cor, fontFamily: '"JetBrains Mono", monospace' }}>{pct.toFixed(0)}%</span>
              </div>
              {/* Progress bar */}
              <div style={{ width: '100%', backgroundColor: '#1E2D40', borderRadius: '999px', height: '6px', marginBottom: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '6px', borderRadius: '999px', background: `linear-gradient(90deg, ${metaMaisProxima.cor}, ${metaMaisProxima.cor}AA)`, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)', boxShadow: `0 0 8px ${metaMaisProxima.cor}60` }} />
              </div>
              <p style={{ fontSize: '12px', color: '#475569', textAlign: 'right', fontFamily: '"JetBrains Mono", monospace' }}>Faltam {formatarMoeda(falta)}</p>
            </div>
          );
        })()}
      </div>

      {/* FAB */}
      <button
        onClick={() => setFormAberto(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 btn-neon animate-glow"
        style={{ width: 56, height: 56, borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#080C14' }}
        title="Nova transação"
      >
        <Plus size={24} />
      </button>

      {formAberto && <TransactionForm transacao={editando} onFechar={fecharForm} />}
    </div>
  );
}
