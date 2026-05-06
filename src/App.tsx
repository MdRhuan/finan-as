import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Login, isLogado } from './components/Login';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Import } from './pages/Import';
import { Reports } from './pages/Reports';
import { Categories } from './pages/Categories';
import { Goals } from './pages/Goals';
import { CalendarPage } from './pages/Calendar';

export default function App() {
  const [logado, setLogado] = useState(isLogado());

  if (!logado) return <Login onSucesso={() => setLogado(true)} />;

  const sair = () => {
    localStorage.removeItem('financeiro_logado');
    setLogado(false);
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <Navigation onSair={sair} />
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
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
