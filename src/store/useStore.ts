import { create } from 'zustand';
import type { Transacao, Categoria, Conta, Meta, TipoTransacao } from '../types';
import { CATEGORIAS_PADRAO } from '../services/categoryService';
import { supabase } from '../integrations/supabase/client';

const CONTAS_PADRAO: Conta[] = [
  { id: 'banco', nome: 'Banco', tipo: 'banco', saldo: 0 },
  { id: 'dinheiro', nome: 'Dinheiro', tipo: 'dinheiro', saldo: 0 },
];

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// ---------- Mappers ----------
type DbTx = {
  id: string; tipo: string; valor: number | string; categoria: string;
  data: string; descricao: string; conta: string | null;
};
const fromTx = (r: DbTx): Transacao => ({
  id: r.id, tipo: r.tipo as TipoTransacao, valor: Number(r.valor),
  categoria: r.categoria, data: r.data, descricao: r.descricao,
  conta: r.conta ?? undefined,
});

type DbGoal = {
  id: string; nome: string; descricao: string | null; valor_alvo: number | string;
  valor_atual: number | string; prazo: string; icone: string; cor: string;
  concluida: boolean; created_at: string;
};
const fromGoal = (r: DbGoal): Meta => ({
  id: r.id, nome: r.nome, descricao: r.descricao ?? undefined,
  valorAlvo: Number(r.valor_alvo), valorAtual: Number(r.valor_atual),
  prazo: r.prazo, icone: r.icone, cor: r.cor, concluida: r.concluida,
  criadaEm: r.created_at?.slice(0, 10) ?? '',
});

// ---------- Load with auto-seed of defaults ----------
async function loadCategorias(u: string): Promise<Categoria[]> {
  const { data } = await supabase.from('categories').select('*').eq('user_id', u);
  if (data && data.length > 0) {
    return data.map((c) => ({ id: c.id, nome: c.nome, cor: c.cor, icone: c.icone }));
  }
  const seed = CATEGORIAS_PADRAO.map((c) => ({ ...c, user_id: u }));
  await supabase.from('categories').insert(seed);
  return CATEGORIAS_PADRAO;
}

async function loadContas(u: string): Promise<Conta[]> {
  const { data } = await supabase.from('accounts').select('*').eq('user_id', u);
  if (data && data.length > 0) {
    return data.map((c) => ({ id: c.id, nome: c.nome, tipo: c.tipo as Conta['tipo'], saldo: Number(c.saldo) }));
  }
  const seed = CONTAS_PADRAO.map((c) => ({ ...c, user_id: u }));
  await supabase.from('accounts').insert(seed);
  return CONTAS_PADRAO;
}

async function loadTransacoes(u: string): Promise<Transacao[]> {
  const { data } = await supabase.from('transactions').select('*')
    .eq('user_id', u).order('data', { ascending: false });
  return (data ?? []).map(fromTx as (r: unknown) => Transacao);
}

async function loadMetas(u: string): Promise<Meta[]> {
  const { data } = await supabase.from('goals').select('*')
    .eq('user_id', u).order('created_at', { ascending: false });
  return (data ?? []).map(fromGoal as (r: unknown) => Meta);
}

interface Estado {
  transacoes: Transacao[];
  categorias: Categoria[];
  contas: Conta[];
  metas: Meta[];
  mesSelecionado: string;
  carregando: boolean;

  adicionarTransacao: (t: Omit<Transacao, 'id'>) => Promise<void>;
  editarTransacao: (id: string, dados: Partial<Transacao>) => Promise<void>;
  excluirTransacao: (id: string) => Promise<void>;
  importarTransacoes: (ts: Omit<Transacao, 'id'>[]) => Promise<void>;

  adicionarCategoria: (c: Omit<Categoria, 'id'> & { id?: string }) => Promise<void>;
  excluirCategoria: (id: string) => Promise<void>;

  adicionarConta: (c: Omit<Conta, 'id'>) => Promise<void>;
  excluirConta: (id: string) => Promise<void>;

  adicionarMeta: (m: Omit<Meta, 'id' | 'criadaEm' | 'concluida'>) => Promise<void>;
  editarMeta: (id: string, dados: Partial<Meta>) => Promise<void>;
  excluirMeta: (id: string) => Promise<void>;
  depositarNaMeta: (id: string, valor: number) => Promise<void>;

  setMesSelecionado: (mes: string) => void;

  recarregar: () => Promise<void>;
  limparTudo: () => Promise<void>;
}

export const useStore = create<Estado>((set, get) => ({
  transacoes: [],
  categorias: [],
  contas: [],
  metas: [],
  mesSelecionado: '2026-04',
  carregando: false,

  recarregar: async () => {
    const u = await uid();
    if (!u) {
      set({ transacoes: [], categorias: [], contas: [], metas: [] });
      return;
    }
    set({ carregando: true });
    const [transacoes, categorias, contas, metas] = await Promise.all([
      loadTransacoes(u), loadCategorias(u), loadContas(u), loadMetas(u),
    ]);
    set({ transacoes, categorias, contas, metas, carregando: false });
  },

  adicionarTransacao: async (dados) => {
    const u = await uid(); if (!u) return;
    const { data, error } = await supabase.from('transactions').insert({
      user_id: u, tipo: dados.tipo, valor: dados.valor, categoria: dados.categoria,
      data: dados.data, descricao: dados.descricao, conta: dados.conta ?? null,
    }).select().single();
    if (error || !data) return;
    set({ transacoes: [fromTx(data as DbTx), ...get().transacoes] });
  },

  editarTransacao: async (id, dados) => {
    const u = await uid(); if (!u) return;
    const patch: Record<string, unknown> = {};
    for (const k of ['tipo', 'valor', 'categoria', 'data', 'descricao', 'conta'] as const) {
      if (k in dados) patch[k] = dados[k] ?? null;
    }
    const { error } = await supabase.from('transactions').update(patch as never).eq('id', id);
    if (error) return;
    set({ transacoes: get().transacoes.map((t) => t.id === id ? { ...t, ...dados } : t) });
  },

  excluirTransacao: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) return;
    set({ transacoes: get().transacoes.filter((t) => t.id !== id) });
  },

  importarTransacoes: async (novas) => {
    const u = await uid(); if (!u) return;
    const rows = novas.map((t) => ({
      user_id: u, tipo: t.tipo, valor: t.valor, categoria: t.categoria,
      data: t.data, descricao: t.descricao, conta: t.conta ?? null,
    }));
    const { data, error } = await supabase.from('transactions').insert(rows).select();
    if (error || !data) return;
    const inseridas = (data as DbTx[]).map(fromTx);
    set({ transacoes: [...inseridas, ...get().transacoes] });
  },

  adicionarCategoria: async (dados) => {
    const u = await uid(); if (!u) return;
    const id = dados.id || `cat_${Date.now()}`;
    const { error } = await supabase.from('categories').insert({
      user_id: u, id, nome: dados.nome, cor: dados.cor, icone: dados.icone,
    });
    if (error) return;
    set({ categorias: [...get().categorias, { id, nome: dados.nome, cor: dados.cor, icone: dados.icone }] });
  },

  excluirCategoria: async (id) => {
    const u = await uid(); if (!u) return;
    const { error } = await supabase.from('categories').delete().eq('user_id', u).eq('id', id);
    if (error) return;
    set({ categorias: get().categorias.filter((c) => c.id !== id) });
  },

  adicionarConta: async (dados) => {
    const u = await uid(); if (!u) return;
    const id = `conta_${Date.now()}`;
    const { error } = await supabase.from('accounts').insert({
      user_id: u, id, nome: dados.nome, tipo: dados.tipo, saldo: dados.saldo,
    });
    if (error) return;
    set({ contas: [...get().contas, { ...dados, id }] });
  },

  excluirConta: async (id) => {
    const u = await uid(); if (!u) return;
    const { error } = await supabase.from('accounts').delete().eq('user_id', u).eq('id', id);
    if (error) return;
    set({ contas: get().contas.filter((c) => c.id !== id) });
  },

  adicionarMeta: async (dados) => {
    const u = await uid(); if (!u) return;
    const { data, error } = await supabase.from('goals').insert({
      user_id: u, nome: dados.nome, descricao: dados.descricao ?? null,
      valor_alvo: dados.valorAlvo, valor_atual: dados.valorAtual,
      prazo: dados.prazo, icone: dados.icone, cor: dados.cor, concluida: false,
    }).select().single();
    if (error || !data) return;
    set({ metas: [fromGoal(data as DbGoal), ...get().metas] });
  },

  editarMeta: async (id, dados) => {
    const patch: Record<string, unknown> = {};
    if ('nome' in dados) patch.nome = dados.nome;
    if ('descricao' in dados) patch.descricao = dados.descricao ?? null;
    if ('valorAlvo' in dados) patch.valor_alvo = dados.valorAlvo;
    if ('valorAtual' in dados) patch.valor_atual = dados.valorAtual;
    if ('prazo' in dados) patch.prazo = dados.prazo;
    if ('icone' in dados) patch.icone = dados.icone;
    if ('cor' in dados) patch.cor = dados.cor;
    if ('concluida' in dados) patch.concluida = dados.concluida;
    const { error } = await supabase.from('goals').update(patch as never).eq('id', id);
    if (error) return;
    set({ metas: get().metas.map((m) => m.id === id ? { ...m, ...dados } : m) });
  },

  excluirMeta: async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) return;
    set({ metas: get().metas.filter((m) => m.id !== id) });
  },

  depositarNaMeta: async (id, valor) => {
    const meta = get().metas.find((m) => m.id === id);
    if (!meta) return;
    const novoValor = Math.min(meta.valorAtual + valor, meta.valorAlvo);
    const concluida = novoValor >= meta.valorAlvo;
    const { error } = await supabase.from('goals').update({ valor_atual: novoValor, concluida }).eq('id', id);
    if (error) return;
    set({ metas: get().metas.map((m) => m.id === id ? { ...m, valorAtual: novoValor, concluida } : m) });
  },

  setMesSelecionado: (mes) => set({ mesSelecionado: mes }),

  limparTudo: async () => {
    const u = await uid(); if (!u) return;
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', u),
      supabase.from('goals').delete().eq('user_id', u),
      supabase.from('categories').delete().eq('user_id', u),
      supabase.from('accounts').delete().eq('user_id', u),
    ]);
    await get().recarregar();
  },
}));
