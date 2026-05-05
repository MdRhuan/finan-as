import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid } from 'recharts';
import { useStore } from '../store/useStore';
import { gerarResumoMeses, calcularPorCategoria, filtrarPorMes, transacoesValidas } from '../services/transactionService';
import { formatarMoeda } from '../utils/formatCurrency';
import { formatarMes } from '../utils/formatDate';

const card: React.CSSProperties = {
  background: 'rgba(17,24,39,0.7)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid #1E2D40',
  padding: '20px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
};

const tooltipStyle = {
  borderRadius: '10px',
  border: '1px solid #1E2D40',
  fontSize: 12,
  backgroundColor: '#0D1220',
  color: '#E2E8F0',
};

export function Reports() {
  const { transacoes, categorias, mesSelecionado } = useStore();
  const validas = useMemo(() => transacoesValidas(transacoes), [transacoes]);

  const resumosMeses = useMemo(() => gerarResumoMeses(validas, 6), [validas]);
  const doMes = useMemo(() => filtrarPorMes(validas, mesSelecionado), [validas, mesSelecionado]);
  const porCategoriaDoMes = useMemo(() => calcularPorCategoria(doMes), [doMes]);

  const dadosBarras = resumosMeses.map((r) => ({
    mes: formatarMes(r.mes).slice(0, 3),
    receitas: r.receitas,
    despesas: r.despesas,
  }));

  const dadosPizzaCategoria = Object.entries(porCategoriaDoMes)
    .sort((a, b) => b[1] - a[1])
    .map(([nome, valor]) => {
      const cat = categorias.find((c) => c.nome === nome);
      return { nome, valor, cor: cat?.cor || '#475569', icone: cat?.icone || '📦' };
    });

  const totalDespesas = dadosPizzaCategoria.reduce((a, b) => a + b.valor, 0);
  const resumoAtual = resumosMeses.find((r) => r.mes === mesSelecionado);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#E2E8F0', margin: 0, letterSpacing: '-0.03em' }}>Relatórios</h1>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontFamily: '"JetBrains Mono", monospace', textTransform: 'capitalize' }}>{formatarMes(mesSelecionado)}</p>
      </div>

      {/* Resumo do mês */}
      {resumoAtual && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { label: 'Receitas', valor: resumoAtual.receitas, accent: '#10B981' },
            { label: 'Despesas', valor: resumoAtual.despesas, accent: '#F43F5E' },
            { label: 'Saldo', valor: resumoAtual.saldo, accent: resumoAtual.saldo >= 0 ? '#00F5D4' : '#F43F5E' },
          ].map((item) => (
            <div key={item.label} style={{
              background: 'rgba(17,24,39,0.7)',
              backdropFilter: 'blur(12px)',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'center',
              border: `1px solid ${item.accent}25`,
              boxShadow: `0 0 20px ${item.accent}10`,
            }}>
              <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>{item.label}</p>
              <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: item.accent, letterSpacing: '-0.02em' }}>{formatarMoeda(item.valor)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Gráfico barras */}
      <div style={card}>
        <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receitas vs Despesas (6 meses)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dadosBarras} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D40" vertical={false} />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontFamily: '"JetBrains Mono", monospace' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontFamily: '"JetBrains Mono", monospace' }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v, name) => [formatarMoeda(Number(v)), name === 'receitas' ? 'Receitas' : 'Despesas']} contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" fill="#F43F5E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribuição por categoria */}
      <div style={card}>
        <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distribuição por Categoria</h2>
        {dadosPizzaCategoria.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '14px', padding: '32px 0' }}>Nenhuma despesa no mês selecionado</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dadosPizzaCategoria} dataKey="valor" cx="50%" cy="50%" outerRadius={80} innerRadius={50} strokeWidth={0}>
                  {dadosPizzaCategoria.map((d, i) => <Cell key={i} fill={d.cor} />)}
                </Pie>
                <Tooltip formatter={(v) => formatarMoeda(Number(v))} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dadosPizzaCategoria.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: d.cor, flexShrink: 0, boxShadow: `0 0 6px ${d.cor}` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.icone} {d.nome}</span>
                      <span style={{ fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: d.cor, marginLeft: '8px', flexShrink: 0 }}>{formatarMoeda(d.valor)}</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#1E2D40', borderRadius: '999px', height: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(d.valor / totalDespesas) * 100}%`, height: '4px', borderRadius: '999px', backgroundColor: d.cor, boxShadow: `0 0 6px ${d.cor}60` }} />
                    </div>
                    <p style={{ fontSize: '10px', color: '#475569', marginTop: '2px', fontFamily: '"JetBrains Mono", monospace' }}>{((d.valor / totalDespesas) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
