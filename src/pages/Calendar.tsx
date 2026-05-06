import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatarMes } from '../utils/formatDate';
import { formatarMoeda } from '../utils/formatCurrency';

function mudarMes(mes: string, delta: number): string {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(a, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function CalendarPage() {
  const { transacoes } = useStore();
  const [mes, setMes] = useState(() => {
    const a = new Date();
    return `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, '0')}`;
  });

  const [ano, mesNum] = mes.split('-').map(Number);
  const primeiroDia = new Date(ano, mesNum - 1, 1);
  const diasNoMes = new Date(ano, mesNum, 0).getDate();
  const inicioSemana = primeiroDia.getDay(); // 0=dom

  const porDia = useMemo(() => {
    const map: Record<number, { receita: number; despesa: number }> = {};
    for (let d = 1; d <= diasNoMes; d++) map[d] = { receita: 0, despesa: 0 };
    transacoes.forEach((t) => {
      if (!t.data.startsWith(mes)) return;
      const dia = parseInt(t.data.slice(8, 10));
      if (!map[dia]) return;
      if (t.tipo === 'receita') map[dia].receita += t.valor;
      else map[dia].despesa += t.valor;
    });
    return map;
  }, [transacoes, mes, diasNoMes]);

  let diaMaiorReceita = 0, diaMaiorDespesa = 0;
  let maxR = 0, maxD = 0;
  Object.entries(porDia).forEach(([d, v]) => {
    if (v.receita > maxR) { maxR = v.receita; diaMaiorReceita = parseInt(d); }
    if (v.despesa > maxD) { maxD = v.despesa; diaMaiorDespesa = parseInt(d); }
  });

  const totRec = Object.values(porDia).reduce((a, b) => a + b.receita, 0);
  const totDesp = Object.values(porDia).reduce((a, b) => a + b.despesa, 0);

  const diasSem = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const celulas: (number | null)[] = [];
  for (let i = 0; i < inicioSemana; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(d);
  while (celulas.length % 7 !== 0) celulas.push(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="t-page" style={{ margin: 0 }}>Calendário</h1>
          <p className="t-label" style={{ marginTop: 2 }}>movimentações por dia</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 10px' }}>
          <button onClick={() => setMes(mudarMes(mes, -1))} style={btnIcon}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 130, textAlign: 'center', textTransform: 'capitalize' }}>{formatarMes(mes)}</span>
          <button onClick={() => setMes(mudarMes(mes, 1))} style={btnIcon}><ChevronRight size={14} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <Resumo label="Receitas" valor={totRec} cor="var(--pos)" />
        <Resumo label="Despesas" valor={totDesp} cor="var(--neg)" />
        <Resumo label="Saldo" valor={totRec - totDesp} cor={totRec - totDesp >= 0 ? 'var(--pos)' : 'var(--neg)'} />
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
          {diasSem.map((d) => (
            <div key={d} className="t-th" style={{ textAlign: 'center', padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {celulas.map((d, i) => {
            if (d === null) return <div key={i} style={{ aspectRatio: '1', minHeight: 70 }} />;
            const dados = porDia[d];
            const isMaiorR = d === diaMaiorReceita && maxR > 0;
            const isMaiorD = d === diaMaiorDespesa && maxD > 0;
            const teveMov = dados.receita > 0 || dados.despesa > 0;
            let bg = 'var(--card)';
            let border = '1px solid var(--border)';
            let textColor = 'var(--text)';
            if (isMaiorR) { bg = 'var(--pos)'; border = '1px solid var(--pos)'; textColor = '#fff'; }
            else if (isMaiorD) { bg = 'var(--neg)'; border = '1px solid var(--neg)'; textColor = '#fff'; }
            return (
              <div key={i} style={{
                background: bg, border, borderRadius: 12,
                padding: 8, minHeight: 70, display: 'flex', flexDirection: 'column',
                gap: 4, color: textColor,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{d}</span>
                {teveMov && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 10, fontWeight: 500 }}>
                    {dados.receita > 0 && (
                      <span style={{ color: isMaiorR ? '#fff' : 'var(--pos)' }}>+{formatarMoeda(dados.receita)}</span>
                    )}
                    {dados.despesa > 0 && (
                      <span style={{ color: isMaiorD ? '#fff' : 'var(--neg)' }}>-{formatarMoeda(dados.despesa)}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
          <Legenda cor="var(--pos)" label="Maior receita do mês" />
          <Legenda cor="var(--neg)" label="Maior despesa do mês" />
        </div>
      </div>
    </div>
  );
}

const btnIcon: React.CSSProperties = { padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text)' };

function Resumo({ label, valor, cor }: { label: string; valor: number; cor: string }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 16 }}>
      <p className="t-label" style={{ margin: 0, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: cor, margin: 0 }}>{formatarMoeda(valor)}</p>
    </div>
  );
}

function Legenda({ cor, label }: { cor: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 12, height: 12, borderRadius: 4, background: cor }} />
      <span>{label}</span>
    </div>
  );
}
