// Formato canônico interno: ISO yyyy-mm-dd
// Formato exibido sempre: dd/mm/aaaa

export function formatarData(data: string): string {
  if (!data) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const [a, m, d] = data.split('-');
    return `${d}/${m}/${a}`;
  }
  return data;
}

export function formatarDataCurta(data: string): string {
  return formatarData(data);
}

export function formatarMes(mes: string): string {
  const [ano, m] = mes.split('-');
  const d = new Date(parseInt(ano), parseInt(m) - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d);
}

export function mesAtual(): string {
  const a = new Date();
  return `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, '0')}`;
}

export function dataHoje(): string {
  const a = new Date();
  return `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, '0')}-${String(a.getDate()).padStart(2, '0')}`;
}

export function dataHojeBR(): string {
  return formatarData(dataHoje());
}

// Aceita dd/mm/aaaa, dd-mm-aaaa, yyyy-mm-dd, dd/mm/yy
export function normalizarData(raw: string): string {
  if (!raw) return dataHoje();
  const s = raw.toString().trim();

  const dmY = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (dmY) {
    const [, d, m, a] = dmY;
    const ano = a.length === 2 ? `20${a}` : a;
    return `${ano}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return dataHoje();
}

// Converte dd/mm/aaaa -> yyyy-mm-dd (ou retorna '' se inválido)
export function brParaIso(br: string): string {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}
