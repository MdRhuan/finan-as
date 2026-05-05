export type TipoTransacao = 'receita' | 'despesa';

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  valor: number;
  categoria: string;
  data: string;
  descricao: string;
  conta?: string;
}

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  icone: string;
}

export interface Conta {
  id: string;
  nome: string;
  tipo: 'banco' | 'dinheiro' | 'outro';
  saldo: number;
}

export interface PreviewImportacao {
  linha: number;
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria: string;
  selecionada: boolean;
  erro?: string;
}

export interface ResultadoImportacao {
  preview: PreviewImportacao[];
  totalLinhas: number;
  linhasValidas: number;
  erros: string[];
}

export interface Meta {
  id: string;
  nome: string;
  descricao?: string;
  valorAlvo: number;
  valorAtual: number;
  prazo: string;
  icone: string;
  cor: string;
  concluida: boolean;
  criadaEm: string;
}
