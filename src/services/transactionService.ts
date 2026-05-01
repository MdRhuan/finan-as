import type { Transacao, TipoTransacao } from '../types';

const CHAVE_LS = 'financeiro_transacoes';

export function carregarTransacoes(): Transacao[] {
  try {
    const raw = localStorage.getItem(CHAVE_LS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function salvarTransacoes(transacoes: Transacao[]): void {
  localStorage.setItem(CHAVE_LS, JSON.stringify(transacoes));
}

export function gerarId(): string {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function filtrarPorMes(transacoes: Transacao[], mes: string): Transacao[] {
  return transacoes.filter((t) => t.data.startsWith(mes));
}

export function filtrarPorCategoria(transacoes: Transacao[], categoria: string): Transacao[] {
  if (!categoria) return transacoes;
  return transacoes.filter((t) => t.categoria === categoria);
}

export function calcularSaldo(transacoes: Transacao[]): number {
  return transacoes.reduce((acc, t) => {
    return t.tipo === 'receita' ? acc + t.valor : acc - t.valor;
  }, 0);
}

export function calcularTotalPorTipo(transacoes: Transacao[], tipo: TipoTransacao): number {
  return transacoes.filter((t) => t.tipo === tipo).reduce((acc, t) => acc + t.valor, 0);
}

export function calcularPorCategoria(transacoes: Transacao[]): Record<string, number> {
  return transacoes.reduce<Record<string, number>>((acc, t) => {
    if (t.tipo === 'despesa') {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
    }
    return acc;
  }, {});
}

export function resumoMensal(transacoes: Transacao[], mes: string) {
  const doMes = filtrarPorMes(transacoes, mes);
  return {
    mes,
    receitas: calcularTotalPorTipo(doMes, 'receita'),
    despesas: calcularTotalPorTipo(doMes, 'despesa'),
    saldo: calcularSaldo(doMes),
    porCategoria: calcularPorCategoria(doMes),
  };
}

const MES_INICIO = '2026-04';

export function transacoesValidas(transacoes: Transacao[]): Transacao[] {
  return transacoes.filter((t) => t.data >= MES_INICIO + '-01');
}

export function gerarResumoMeses(transacoes: Transacao[], qtdMeses = 6) {
  const meses: string[] = [];
  const [anoInicio, mesInicio] = MES_INICIO.split('-').map(Number);
  const inicio = new Date(anoInicio, mesInicio - 1, 1);
  const agora = new Date();
  // Referência: o mês mais recente entre hoje e o último mês com dados
  const ref = agora >= inicio ? agora : inicio;
  for (let i = 0; i < qtdMeses; i++) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    if (d < inicio) break;
    meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return meses.reverse().map((m) => resumoMensal(transacoes, m));
}
