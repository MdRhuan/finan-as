import { useState } from "react";
import { Lock, TrendingUp, Mail, UserPlus, Loader2 } from "lucide-react";
import { login, registrar } from "../services/auth";

interface Props {
  onSucesso: () => void;
}

export function Login({ onSucesso }: Props) {
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    const fn = modo === "login" ? login : registrar;
    const r = await fn(email, senha);
    setCarregando(false);
    if (r.ok) onSucesso();
    else setErro(r.erro || "Erro");
  };

  const alternar = () => {
    setErro("");
    setSenha("");
    setModo(modo === "login" ? "cadastro" : "login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 24,
      }}
    >
      <div className="card animate-slide-up" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: "var(--text)", color: "var(--card)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <TrendingUp size={20} />
          </div>
          <div>
            <h1 className="t-page" style={{ margin: 0 }}>Financeiro</h1>
            <p className="t-label" style={{ margin: 0 }}>
              {modo === "login" ? "Entre na sua conta" : "Criar nova conta"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="t-label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Mail size={12} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErro(""); }}
              placeholder="voce@email.com"
              autoFocus
              autoComplete="email"
              required
              className="input"
            />
          </div>

          <div>
            <label className="t-label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Lock size={12} /> Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(""); }}
              placeholder="••••••••"
              autoComplete={modo === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
              className="input"
            />
            {modo === "cadastro" && (
              <p className="t-label" style={{ marginTop: 4 }}>Mínimo de 6 caracteres.</p>
            )}
          </div>

          {erro && <p style={{ fontSize: 12, color: "var(--neg)", margin: 0 }}>{erro}</p>}

          <button type="submit" className="btn-primary" disabled={carregando} style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {carregando && <Loader2 size={14} className="animate-spin" />}
            {modo === "login" ? "Entrar" : "Criar conta"}
          </button>

          <button
            type="button"
            onClick={alternar}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--muted)", fontSize: 12, marginTop: 4,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {modo === "login" ? (
              <><UserPlus size={12} /> Não tem conta? Cadastre-se</>
            ) : (
              <>Já tem conta? Entrar</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
