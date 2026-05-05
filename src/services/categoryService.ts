import type { Categoria } from '../types';

export const CATEGORIAS_PADRAO: Categoria[] = [
  { id: 'alimentacao', nome: 'Alimentação', cor: '#F97316', icone: '🍽️' },
  { id: 'transporte', nome: 'Transporte', cor: '#3B82F6', icone: '🚗' },
  { id: 'contas', nome: 'Contas', cor: '#8B5CF6', icone: '📄' },
  { id: 'lazer', nome: 'Lazer', cor: '#EC4899', icone: '🎮' },
  { id: 'saude', nome: 'Saúde', cor: '#10B981', icone: '❤️' },
  { id: 'educacao', nome: 'Educação', cor: '#0EA5E9', icone: '📚' },
  { id: 'salario', nome: 'Salário', cor: '#22C55E', icone: '💰' },
  { id: 'investimentos', nome: 'Investimentos', cor: '#F59E0B', icone: '📈' },
  { id: 'outros', nome: 'Outros', cor: '#6B7280', icone: '📦' },
  { id: 'outros-receita', nome: 'Outros (Receita)', cor: '#059669', icone: '💵' },
];

const CHAVE_LS = 'financeiro_categorias';

export function carregarCategorias(): Categoria[] {
  try {
    const raw = localStorage.getItem(CHAVE_LS);
    if (!raw) return CATEGORIAS_PADRAO;
    const salvas: Categoria[] = JSON.parse(raw);
    // Merge: padrao + customizadas
    const ids = new Set(salvas.map((c) => c.id));
    const novas = CATEGORIAS_PADRAO.filter((c) => !ids.has(c.id));
    return [...salvas, ...novas];
  } catch {
    return CATEGORIAS_PADRAO;
  }
}

export function salvarCategorias(categorias: Categoria[]): void {
  localStorage.setItem(CHAVE_LS, JSON.stringify(categorias));
}

export function gerarIdCategoria(nome: string): string {
  return nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
}
