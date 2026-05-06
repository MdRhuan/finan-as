import { useState } from 'react';
import { Lock, TrendingUp } from 'lucide-react';

const SENHA = '1234'; // Altere aqui para definir a senha de acesso
const CHAVE = 'financeiro_logado';

export function isLogado(): boolean {
  return localStorage.getItem(CHAVE) === '1';
}

interface Props { onSucesso: () => void; }

export function Login({ onSucesso }: Props) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha === SENHA) {
      localStorage.setItem(CHAVE, '1');
      onSucesso();
    } else {
      setErro('Senha incorreta');
      setSenha('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div className="card animate-slide-up" style={{ width: '100%', maxWidth: 380, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--text)', color: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <h1 className="t-page" style={{ margin: 0 }}>Financeiro</h1>
            <p className="t-label" style={{ margin: 0 }}>Personal finance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label className="t-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={12} /> Senha de acesso
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErro(''); }}
            placeholder="••••"
            autoFocus
            className="input"
            style={{ fontSize: 18, letterSpacing: 4, textAlign: 'center' }}
          />
          {erro && <p style={{ fontSize: 12, color: 'var(--neg)', margin: 0 }}>{erro}</p>}
          <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
