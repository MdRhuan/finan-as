import { useState } from 'react';
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
import { usuarioAtual, logout } from './services/auth';
import { useStore } from './store/useStore';

export default function App() {
  const [usuario, setUsuario] = useState<string | null>(usuarioAtual());
  const recarregar = useStore((s) => s.recarregar);

  const aoEntrar = () => {
    recarregar();
    setUsuario(usuarioAtual());
  };

  const sair = () => {
    logout();
    setUsuario(null);
  };

  if (!usuario) return <Login onSucesso={aoEntrar} />;

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
