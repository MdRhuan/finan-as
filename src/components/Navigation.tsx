import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Upload, BarChart3, Tag, Star, Calendar, TrendingUp, LogOut } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transacoes', icon: ArrowLeftRight, label: 'Transações' },
  { to: '/calendario', icon: Calendar, label: 'Calendário' },
  { to: '/metas', icon: Star, label: 'Metas' },
  { to: '/importar', icon: Upload, label: 'Importar' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/categorias', icon: Tag, label: 'Categorias' },
];

interface Props { onSair: () => void; }

export function Navigation({ onSair }: Props) {
  return (
    <>
      <aside
        className="hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0"
        style={{ width: 240, background: 'var(--card)', borderRight: '1px solid var(--border)' }}
      >
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--text)', color: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Financeiro</span>
              <div className="t-label" style={{ marginTop: -2 }}>Personal finance</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                fontSize: 14, fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--card)' : 'var(--text)',
                background: isActive ? 'var(--text)' : 'transparent',
                transition: 'all .15s',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <button onClick={onSair} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* Bottom nav mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 4px', overflowX: 'auto' }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 8px', borderRadius: 10, textDecoration: 'none',
                color: isActive ? 'var(--text)' : 'var(--muted)',
                fontWeight: isActive ? 600 : 500,
              })}
            >
              <Icon size={18} />
              <span style={{ fontSize: 10 }}>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
