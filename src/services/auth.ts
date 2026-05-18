// Autenticação via Supabase Auth. Dados financeiros continuam em localStorage,
// porém isolados por user.id do Supabase.

import { supabase } from '../integrations/supabase/client';

const CACHE_UID = 'financeiro_uid';
const CACHE_EMAIL = 'financeiro_email';

function setCache(uid: string | null, email: string | null) {
  if (uid) localStorage.setItem(CACHE_UID, uid);
  else localStorage.removeItem(CACHE_UID);
  if (email) localStorage.setItem(CACHE_EMAIL, email);
  else localStorage.removeItem(CACHE_EMAIL);
}

function uidAtual(): string | null {
  return localStorage.getItem(CACHE_UID);
}

export function usuarioAtual(): string | null {
  // Retorna o email para exibição (ou null se não autenticado).
  return localStorage.getItem(CACHE_EMAIL);
}

export async function inicializarSessao(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  setCache(u?.id ?? null, u?.email ?? null);
  return u?.email ?? null;
}

function traduzirErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'Email ou senha incorretos';
  if (m.includes('already registered') || m.includes('user already')) return 'Email já cadastrado';
  if (m.includes('password should be at least')) return 'Senha deve ter no mínimo 6 caracteres';
  if (m.includes('invalid email')) return 'Email inválido';
  if (m.includes('email not confirmed')) return 'Confirme seu email antes de entrar';
  if (m.includes('pwned') || m.includes('compromised')) return 'Essa senha apareceu em vazamentos. Escolha outra.';
  return msg;
}

export async function registrar(email: string, senha: string): Promise<{ ok: boolean; erro?: string }> {
  const e = email.trim().toLowerCase();
  if (!e) return { ok: false, erro: 'Informe um email' };
  if (!senha) return { ok: false, erro: 'Informe uma senha' };
  const redirectUrl = `${window.location.origin}/`;
  const { data, error } = await supabase.auth.signUp({
    email: e,
    password: senha,
    options: { emailRedirectTo: redirectUrl },
  });
  if (error) return { ok: false, erro: traduzirErro(error.message) };
  const u = data.user;
  if (data.session) {
    setCache(u?.id ?? null, u?.email ?? null);
    return { ok: true };
  }
  return { ok: false, erro: 'Verifique seu email para confirmar o cadastro.' };
}

export async function login(email: string, senha: string): Promise<{ ok: boolean; erro?: string }> {
  const e = email.trim().toLowerCase();
  if (!e || !senha) return { ok: false, erro: 'Preencha email e senha' };
  const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: senha });
  if (error) return { ok: false, erro: traduzirErro(error.message) };
  setCache(data.user?.id ?? null, data.user?.email ?? null);
  return { ok: true };
}

export async function logout() {
  await supabase.auth.signOut();
  setCache(null, null);
}

// Chave de armazenamento isolada por usuário (usa o user.id do Supabase).
export function chaveUsuario(sufixo: string): string {
  const u = uidAtual() || '_anon';
  return `financeiro_u_${u}_${sufixo}`;
}

// Limpa apenas os dados financeiros do usuário logado (não deleta a conta).
export function limparDadosUsuario() {
  const u = uidAtual();
  if (!u) return;
  const prefixo = `financeiro_u_${u}_`;
  const chaves: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefixo)) chaves.push(k);
  }
  chaves.forEach((k) => localStorage.removeItem(k));
}

// Listener de mudanças de sessão. Retorna unsubscribe.
export function aoMudarSessao(cb: (email: string | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const u = session?.user;
    setCache(u?.id ?? null, u?.email ?? null);
    cb(u?.email ?? null);
  });
  return () => data.subscription.unsubscribe();
}
