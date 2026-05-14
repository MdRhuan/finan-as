import { useState } from "react";
import { Lock, TrendingUp, User, UserPlus } from "lucide-react";
import { login, registrar, existeUsuario } from "../services/auth";

interface Props {
  onSucesso: () => void;
}

export function Login({ onSucesso }: Props) {
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fn = modo === "login" ? login : registrar;
    const r = fn(usuario, senha);
    if (r.ok) {
      onSucesso();
    } else {
      setErro(r.erro || "Erro");
    }
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
              <User size={12} /> Nome de usuário
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => { setUsuario(e.target.value); setErro(""); }}
              placeholder="seu_usuario"
              autoFocus
              autoComplete="username"
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
              className="input"
            />
          </div>

          {erro && <p style={{ fontSize: 12, color: "var(--neg)", margin: 0 }}>{erro}</p>}

          <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
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

          {modo === "login" && usuario && !existeUsuario(usuario) && (
            <p className="t-label" style={{ margin: 0, textAlign: "center" }}>
              Usuário não encontrado. Crie uma conta.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
