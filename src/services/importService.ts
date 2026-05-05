import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { PreviewImportacao, ResultadoImportacao, TipoTransacao } from '../types';
import { normalizarData } from '../utils/formatDate';
import { detectarCategoria, detectarTipoTransacao } from '../utils/detectCategory';

type LinhaRaw = Record<string, string>;

// ─── Parsers ──────────────────────────────────────────────────────────────────

export async function parseCSV(arquivo: File): Promise<LinhaRaw[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(arquivo, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (resultado) => resolve(resultado.data as LinhaRaw[]),
      error: (err) => reject(new Error(`Erro ao ler CSV: ${err.message}`)),
    });
  });
}

export async function parseExcel(arquivo: File): Promise<LinhaRaw[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const linhas = XLSX.utils.sheet_to_json<LinhaRaw>(sheet, { raw: false, dateNF: 'yyyy-mm-dd' });
        resolve(linhas);
      } catch {
        reject(new Error('Erro ao ler arquivo Excel'));
      }
    };
    reader.onerror = () => reject(new Error('Falha ao carregar arquivo'));
    reader.readAsArrayBuffer(arquivo);
  });
}

// ─── Mapeamento de colunas ────────────────────────────────────────────────────

const MAPA_DATA = ['data', 'date', 'dt', 'dia', 'data lançamento', 'data lancamento', 'data transação', 'data transacao', 'competência'];
const MAPA_DESC = ['descricao', 'descrição', 'description', 'historico', 'histórico', 'memo', 'detalhes', 'lancamento', 'lançamento', 'comerciante', 'estabelecimento'];
const MAPA_VALOR = ['valor', 'value', 'amount', 'quantia', 'montante', 'vlr', 'vl'];
const MAPA_TIPO = ['tipo', 'type', 'natureza', 'operacao', 'operação'];
const MAPA_CATEGORIA = ['categoria', 'category', 'cat', 'grupo'];

function encontrarColuna(colunas: string[], candidatos: string[]): string | null {
  const cols = colunas.map((c) => c.toLowerCase().trim());
  for (const c of candidatos) {
    const idx = cols.findIndex((col) => col.includes(c));
    if (idx !== -1) return colunas[idx];
  }
  return null;
}

export function mapearColunas(linhas: LinhaRaw[]) {
  if (linhas.length === 0) throw new Error('Arquivo vazio');
  const colunas = Object.keys(linhas[0]);
  return {
    data: encontrarColuna(colunas, MAPA_DATA),
    descricao: encontrarColuna(colunas, MAPA_DESC),
    valor: encontrarColuna(colunas, MAPA_VALOR),
    tipo: encontrarColuna(colunas, MAPA_TIPO),
    categoria: encontrarColuna(colunas, MAPA_CATEGORIA),
  };
}

// ─── Normalização ─────────────────────────────────────────────────────────────

function parsearValorBR(texto: string): number {
  if (!texto) return NaN;
  const limpo = texto.toString()
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(limpo);
}

export function normalizarDados(linhas: LinhaRaw[], mapa: ReturnType<typeof mapearColunas>): PreviewImportacao[] {
  return linhas.map((linha, idx) => {
    const erros: string[] = [];

    const dataRaw = mapa.data ? linha[mapa.data] : '';
    const descricaoRaw = mapa.descricao ? linha[mapa.descricao] : '';
    const valorRaw = mapa.valor ? linha[mapa.valor] : '';
    const tipoRaw = mapa.tipo ? linha[mapa.tipo] : '';
    const categoriaRaw = mapa.categoria ? linha[mapa.categoria] : '';

    const data = normalizarData(dataRaw);
    const descricao = descricaoRaw?.toString().trim() || `Transação ${idx + 1}`;

    let valor = parsearValorBR(valorRaw?.toString());
    if (isNaN(valor)) {
      erros.push('Valor inválido');
      valor = 0;
    }

    const tipo = detectarTipoTransacaoComHint(valor, tipoRaw, descricao);
    const valorAbs = Math.abs(valor);
    const categoria = categoriaRaw?.toString().trim() || detectarCategoria(descricao, tipo);

    return {
      linha: idx + 1,
      data,
      descricao,
      valor: valorAbs,
      tipo,
      categoria,
      selecionada: erros.length === 0,
      erro: erros.length > 0 ? erros.join('; ') : undefined,
    };
  });
}

function detectarTipoTransacaoComHint(valor: number, tipoHint: string, descricao: string): TipoTransacao {
  const hint = tipoHint?.toLowerCase() || '';
  if (hint.includes('receita') || hint.includes('credito') || hint.includes('crédito') || hint.includes('credit') || hint.includes('entrada')) return 'receita';
  if (hint.includes('despesa') || hint.includes('debito') || hint.includes('débito') || hint.includes('debit') || hint.includes('saida') || hint.includes('saída')) return 'despesa';
  return detectarTipoTransacao(valor, descricao);
}

// ─── Pipeline principal ───────────────────────────────────────────────────────

export async function processarArquivo(arquivo: File, onProgresso?: (p: number) => void): Promise<ResultadoImportacao> {
  const ext = arquivo.name.split('.').pop()?.toLowerCase();

  onProgresso?.(10);
  let linhasRaw: LinhaRaw[];

  if (ext === 'csv') {
    linhasRaw = await parseCSV(arquivo);
  } else if (ext === 'xlsx' || ext === 'xls') {
    linhasRaw = await parseExcel(arquivo);
  } else {
    throw new Error('Formato não suportado. Use CSV ou XLSX.');
  }

  onProgresso?.(40);

  if (linhasRaw.length === 0) throw new Error('Arquivo sem dados');

  const mapa = mapearColunas(linhasRaw);
  if (!mapa.valor) throw new Error('Coluna de valor não encontrada. Verifique o formato do arquivo.');

  onProgresso?.(70);

  const preview = normalizarDados(linhasRaw, mapa);

  onProgresso?.(100);

  const erros: string[] = [];
  if (!mapa.data) erros.push('Coluna de data não encontrada — usando data de hoje');
  if (!mapa.descricao) erros.push('Coluna de descrição não encontrada');

  return {
    preview,
    totalLinhas: linhasRaw.length,
    linhasValidas: preview.filter((p) => !p.erro).length,
    erros,
  };
}
