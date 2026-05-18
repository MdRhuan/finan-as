import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Login } from './components/Login';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Import } from './pages/Import';
import { Reports } from './pages/Reports';
import { Categories } from './pages/Categories';
import { Goals } from './pages/Goals';
import { CalendarPage } from './pages/Calendar';
import { Settings } from './pages/Settings';
import { aoMudarSessao, inicializarSessao, logout, usuarioAtual } from './services/auth';
import { useStore } from './store/useStore';

export default function App() {
  const [usuario, setUsuario] = useState<string | null>(usuarioAtual());
  const [carregando, setCarregando] = useState(true);
  const recarregar = useStore((s) => s.recarregar);

  useEffect(() => {
    // Listener PRIMEIRO, depois getSession (recomendação Supabase).
    const unsub = aoMudarSessao((email) => {
      setUsuario(email);
      recarregar();
    });
    inicializarSessao().then((email) => {
      setUsuario(email);
      recarregar();
      setCarregando(false);
    });
    return () => unsub();
  }, [recarregar]);

  const sair = async () => {
    await logout();
    setUsuario(null);
  };

  if (carregando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p className="t-label">Carregando...</p>
      </div>
    );
  }

  if (!usuario) return <Login onSucesso={() => { /* listener atualizará o estado */ }} />;

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <Navigation onSair={sair} usuario={usuario} />
        <main className="flex-1 overflow-y-auto min-h-screen" style={{ padding: '28px 24px 96px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transacoes" element={<Transactions />} />
              <Route path="/calendario" element={<CalendarPage />} />
              <Route path="/importar" element={<Import />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/categorias" element={<Categories />} />
              <Route path="/metas" element={<Goals />} />
              <Route path="/configuracoes" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
