import { create } from 'zustand';
import type { Transacao, Categoria, Conta, Meta } from '../types';
import { carregarTransacoes, salvarTransacoes, gerarId } from '../services/transactionService';
import { carregarCategorias, salvarCategorias, CATEGORIAS_PADRAO } from '../services/categoryService';
import { chaveUsuario, limparDadosUsuario } from '../services/auth';

const SUFIXO_CONTAS = 'contas';
const SUFIXO_METAS = 'metas';

const CONTAS_PADRAO: Conta[] = [
  { id: 'banco', nome: 'Banco', tipo: 'banco', saldo: 0 },
  { id: 'dinheiro', nome: 'Dinheiro', tipo: 'dinheiro', saldo: 0 },
];

function carregarContas(): Conta[] {
  try {
    const raw = localStorage.getItem(chaveUsuario(SUFIXO_CONTAS));
    return raw ? JSON.parse(raw) : CONTAS_PADRAO;
  } catch { return CONTAS_PADRAO; }
}

function salvarContas(contas: Conta[]) {
  localStorage.setItem(chaveUsuario(SUFIXO_CONTAS), JSON.stringify(contas));
}

function carregarMetas(): Meta[] {
  try {
    const raw = localStorage.getItem(chaveUsuario(SUFIXO_METAS));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function salvarMetas(metas: Meta[]): void {
  localStorage.setItem(chaveUsuario(SUFIXO_METAS), JSON.stringify(metas));
}

interface Estado {
  transacoes: Transacao[];
  categorias: Categoria[];
  contas: Conta[];
  metas: Meta[];
  mesSelecionado: string;

  adicionarTransacao: (t: Omit<Transacao, 'id'>) => void;
  editarTransacao: (id: string, dados: Partial<Transacao>) => void;
  excluirTransacao: (id: string) => void;
  importarTransacoes: (ts: Omit<Transacao, 'id'>[]) => void;

  adicionarCategoria: (c: Omit<Categoria, 'id'> & { id?: string }) => void;
  excluirCategoria: (id: string) => void;

  adicionarConta: (c: Omit<Conta, 'id'>) => void;
  excluirConta: (id: string) => void;

  adicionarMeta: (m: Omit<Meta, 'id' | 'criadaEm' | 'concluida'>) => void;
  editarMeta: (id: string, dados: Partial<Meta>) => void;
  excluirMeta: (id: string) => void;
  depositarNaMeta: (id: string, valor: number) => void;

  setMesSelecionado: (mes: string) => void;

  recarregar: () => void;
  limparTudo: () => void;
}

export const useStore = create<Estado>((set, get) => ({
  transacoes: carregarTransacoes(),
  categorias: carregarCategorias(),
  contas: carregarContas(),
  metas: carregarMetas(),
  mesSelecionado: '2026-04',

  adicionarTransacao: (dados) => {
    const nova: Transacao = { ...dados, id: gerarId() };
    const transacoes = [nova, ...get().transacoes];
    salvarTransacoes(transacoes);
    set({ transacoes });
  },

  editarTransacao: (id, dados) => {
    const transacoes = get().transacoes.map((t) => t.id === id ? { ...t, ...dados } : t);
    salvarTransacoes(transacoes);
    set({ transacoes });
  },

  excluirTransacao: (id) => {
    const transacoes = get().transacoes.filter((t) => t.id !== id);
    salvarTransacoes(transacoes);
    set({ transacoes });
  },

  importarTransacoes: (novas) => {
    const inseridas = novas.map((t) => ({ ...t, id: gerarId() }));
    const transacoes = [...inseridas, ...get().transacoes];
    salvarTransacoes(transacoes);
    set({ transacoes });
  },

  adicionarCategoria: (dados) => {
    const id = dados.id || `cat_${Date.now()}`;
    const categorias = [...get().categorias, { ...dados, id }];
    salvarCategorias(categorias);
    set({ categorias });
  },

  excluirCategoria: (id) => {
    const categorias = get().categorias.filter((c) => c.id !== id);
    salvarCategorias(categorias);
    set({ categorias });
  },

  adicionarConta: (dados) => {
    const conta: Conta = { ...dados, id: `conta_${Date.now()}` };
    const contas = [...get().contas, conta];
    salvarContas(contas);
    set({ contas });
  },

  excluirConta: (id) => {
    const contas = get().contas.filter((c) => c.id !== id);
    salvarContas(contas);
    set({ contas });
  },

  adicionarMeta: (dados) => {
    const nova: Meta = {
      ...dados,
      id: `meta_${Date.now()}`,
      concluida: false,
      criadaEm: new Date().toISOString().slice(0, 10),
    };
    const metas = [...get().metas, nova];
    salvarMetas(metas);
    set({ metas });
  },

  editarMeta: (id, dados) => {
    const metas = get().metas.map((m) => m.id === id ? { ...m, ...dados } : m);
    salvarMetas(metas);
    set({ metas });
  },

  excluirMeta: (id) => {
    const metas = get().metas.filter((m) => m.id !== id);
    salvarMetas(metas);
    set({ metas });
  },

  depositarNaMeta: (id, valor) => {
    const metas = get().metas.map((m) => {
      if (m.id !== id) return m;
      const novoValor = Math.min(m.valorAtual + valor, m.valorAlvo);
      return { ...m, valorAtual: novoValor, concluida: novoValor >= m.valorAlvo };
    });
    salvarMetas(metas);
    set({ metas });
  },

  setMesSelecionado: (mes) => set({ mesSelecionado: mes }),

  recarregar: () => set({
    transacoes: carregarTransacoes(),
    categorias: carregarCategorias(),
    contas: carregarContas(),
    metas: carregarMetas(),
  }),

  limparTudo: () => {
    limparDadosUsuario();
    set({
      transacoes: [],
      categorias: CATEGORIAS_PADRAO,
      contas: CONTAS_PADRAO,
      metas: [],
    });
  },
}));
