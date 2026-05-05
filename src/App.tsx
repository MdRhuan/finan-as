import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Import } from './pages/Import';
import { Reports } from './pages/Reports';
import { Categories } from './pages/Categories';
import { Goals } from './pages/Goals';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#080C14', fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
        <Navigation />
        <main
          className="flex-1 overflow-y-auto min-h-screen"
          style={{ backgroundColor: '#080C14', padding: '28px 24px 96px', backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(0,245,212,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(59,130,246,0.04) 0%, transparent 60%)' }}
        >
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transacoes" element={<Transactions />} />
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
