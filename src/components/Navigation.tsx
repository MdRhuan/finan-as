import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Upload, BarChart3, Tag, Star, TrendingUp } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transacoes', icon: ArrowLeftRight, label: 'Transações' },
  { to: '/metas', icon: Star, label: 'Metas' },
  { to: '/importar', icon: Upload, label: 'Importar' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/categorias', icon: Tag, label: 'Categorias' },
];

export function Navigation() {
  return (
    <>
      {/* Sidebar desktop */}
      <aside
        className="hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0"
        style={{
          width: '240px',
          backgroundColor: '#0D1220',
          borderRight: '1px solid #1E2D40',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1E2D40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00F5D4 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(0,245,212,0.3)',
              }}
            >
              <TrendingUp size={18} style={{ color: '#080C14' }} />
            </div>
            <div>
              <span style={{ fontWeight: 700, color: '#E2E8F0', fontSize: '16px', letterSpacing: '-0.02em' }}>Financeiro</span>
              <div style={{ fontSize: '10px', color: '#00F5D4', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em', marginTop: '-2px' }}>PERSONAL FINANCE</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive ? '#00F5D4' : '#64748B',
                backgroundColor: isActive ? 'rgba(0,245,212,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #00F5D4' : '2px solid transparent',
                transition: 'all 0.15s',
              })}
              className={({ isActive }) => isActive ? '' : 'hover:text-slate-200'}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (!el.classList.contains('active') && el.style.color !== 'rgb(0, 245, 212)') {
                  el.style.backgroundColor = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (el.style.color !== 'rgb(0, 245, 212)') {
                  el.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1E2D40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <p style={{ fontSize: '11px', color: '#475569', fontFamily: '"JetBrains Mono", monospace' }}>dados salvos localmente</p>
          </div>
        </div>
      </aside>

      {/* Bottom nav mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{ backgroundColor: '#0D1220', borderTop: '1px solid #1E2D40', backdropFilter: 'blur(12px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 4px' }}>
          {links.slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '6px 10px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive ? '#00F5D4' : '#475569',
                transition: 'color 0.15s',
              })}
            >
              <Icon size={18} />
              <span style={{ fontSize: '10px', fontWeight: 500 }}>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
