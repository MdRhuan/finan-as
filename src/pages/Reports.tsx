import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { useStore } from '../store/useStore';
import { gerarResumoMeses, calcularPorCategoria, filtrarPorMes, transacoesValidas } from '../services/transactionService';
import { formatarMoeda } from '../utils/formatCurrency';
import { formatarMes } from '../utils/formatDate';

export function Reports() {
  const { transacoes, categorias, mesSelecionado } = useStore();
  const validas = useMemo(() => transacoesValidas(transacoes), [transacoes]);
  const resumos = useMemo(() => gerarResumoMeses(validas, 6), [validas]);
  const doMes = useMemo(() => filtrarPorMes(validas, mesSelecionado), [validas, mesSelecionado]);
  const porCategoria = useMemo(() => calcularPorCategoria(doMes), [doMes]);
  const atual = resumos.find((r) => r.mes === mesSelecionado);

  const dadosBarras = resumos.map((r) => ({
    mes: r.mes.slice(5),
    saldo: r.receitas - r.despesas,
    ativo: r.mes === mesSelecionado,
  }));

  const dadosCat = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]).map(([nome, valor]) => {
    const cat = categorias.find((c) => c.nome === nome);
    return { nome, valor, icone: cat?.icone || '📦' };
  });
  const total = dadosCat.reduce((a, b) => a + b.valor, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 className="t-page" style={{ margin: 0 }}>Relatórios</h1>
        <p className="t-label" style={{ marginTop: 4, textTransform: 'capitalize' }}>{formatarMes(mesSelecionado)}</p>
      </div>

      {atual && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <Box label="Receitas" valor={atual.receitas} cor="var(--pos)" />
          <Box label="Despesas" valor={atual.despesas} cor="var(--neg)" />
          <Box label="Saldo" valor={atual.saldo} cor={atual.saldo >= 0 ? 'var(--pos)' : 'var(--neg)'} />
        </div>
      )}

      <div className="card">
        <h2 className="t-section" style={{ margin: 0, marginBottom: 16 }}>Saldo (6 meses)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dadosBarras}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatarMoeda(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: '#fff' }} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="saldo" radius={[6, 6, 0, 0]}>
              {dadosBarras.map((d, i) => <Cell key={i} fill={d.ativo ? 'var(--bar-active)' : 'var(--bar-inactive)'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="t-section" style={{ margin: 0, marginBottom: 16 }}>Despesas por categoria</h2>
        {dadosCat.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 32 }}>Nenhuma despesa no mês</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dadosCat.map((d) => {
              const pct = (d.valor / total) * 100;
              return (
                <div key={d.nome}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{d.icone} {d.nome}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{formatarMoeda(d.valor)} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({pct.toFixed(1)}%)</span></span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bar-inactive)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--bar-active)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Box({ label, valor, cor }: { label: string; valor: number; cor: string }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 16 }}>
      <p className="t-label" style={{ margin: 0, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: cor, margin: 0 }}>{formatarMoeda(valor)}</p>
    </div>
  );
}
