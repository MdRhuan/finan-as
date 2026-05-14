// Sistema de autenticação simples baseado em localStorage, multiusuário.
// Cada usuário tem seus próprios dados isolados por prefixo de chave.

const CHAVE_USERS = 'financeiro_users';
const CHAVE_ATUAL = 'financeiro_usuario_atual';

interface UsersMap { [username: string]: string }

function hash(senha: string): string {
  // Hash simples (não criptograficamente seguro, mas evita armazenar texto puro).
  let h = 0;
  for (let i = 0; i < senha.length; i++) {
    h = ((h << 5) - h) + senha.charCodeAt(i);
    h |= 0;
  }
  return `h_${h}_${senha.length}`;
}

function carregarUsers(): UsersMap {
  try { return JSON.parse(localStorage.getItem(CHAVE_USERS) || '{}'); }
  catch { return {}; }
}

function salvarUsers(users: UsersMap) {
  localStorage.setItem(CHAVE_USERS, JSON.stringify(users));
}

export function usuarioAtual(): string | null {
  return localStorage.getItem(CHAVE_ATUAL);
}

export function existeUsuario(username: string): boolean {
  const users = carregarUsers();
  return !!users[username.toLowerCase()];
}

export function registrar(username: string, senha: string): { ok: boolean; erro?: string } {
  const u = username.trim().toLowerCase();
  if (!u) return { ok: false, erro: 'Informe um nome de usuário' };
  if (!senha) return { ok: false, erro: 'Informe uma senha' };
  const users = carregarUsers();
  if (users[u]) return { ok: false, erro: 'Usuário já existe' };
  users[u] = hash(senha);
  salvarUsers(users);
  localStorage.setItem(CHAVE_ATUAL, u);
  return { ok: true };
}

export function login(username: string, senha: string): { ok: boolean; erro?: string } {
  const u = username.trim().toLowerCase();
  if (!u || !senha) return { ok: false, erro: 'Preencha usuário e senha' };
  const users = carregarUsers();
  if (!users[u]) return { ok: false, erro: 'Usuário não encontrado' };
  if (users[u] !== hash(senha)) return { ok: false, erro: 'Senha incorreta' };
  localStorage.setItem(CHAVE_ATUAL, u);
  return { ok: true };
}

export function logout() {
  localStorage.removeItem(CHAVE_ATUAL);
}

// Chave de armazenamento isolada por usuário.
export function chaveUsuario(sufixo: string): string {
  const u = usuarioAtual() || '_anon';
  return `financeiro_u_${u}_${sufixo}`;
}

// Limpa todos os dados do usuário logado (mantém o cadastro).
export function limparDadosUsuario() {
  const u = usuarioAtual();
  if (!u) return;
  const prefixo = `financeiro_u_${u}_`;
  const chaves: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefixo)) chaves.push(k);
  }
  chaves.forEach((k) => localStorage.removeItem(k));
}
