export function formatarData(data: string): string {
  const d = new Date(data + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

export function formatarDataCurta(data: string): string {
  const d = new Date(data + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);
}

export function formatarMes(mes: string): string {
  const [ano, m] = mes.split('-');
  const d = new Date(parseInt(ano), parseInt(m) - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d);
}

export function mesAtual(): string {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
}

export function dataHoje(): string {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
}

export function normalizarData(raw: string): string {
  if (!raw) return dataHoje();

  // DD/MM/YYYY
  const dmY = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (dmY) {
    const [, d, m, a] = dmY;
    const ano = a.length === 2 ? `20${a}` : a;
    return `${ano}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD-MM-YYYY
  const dmYh = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (dmYh) {
    const [, d, m, a] = dmYh;
    const ano = a.length === 2 ? `20${a}` : a;
    return `${ano}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // YYYY-MM-DD já está ok
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // Tenta parsear como data genérica
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  return dataHoje();
}
