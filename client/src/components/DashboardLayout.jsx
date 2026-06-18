import { Link, useLocation } from 'react-router-dom';

// ── Icons ────────────────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
  </svg>
);

const IconReviews = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);


const IconCode = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <polyline points="9 18 3 12 9 6" /><polyline points="15 6 21 12 15 18" />
  </svg>
);

// ── NavLink ──────────────────────────────────────────────────────────────────
function NavLink({ to, label, icon, exact = false }) {
  const { pathname } = useLocation();
  const active = exact ? pathname === to : pathname.startsWith(to);

  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'background 0.15s, color 0.15s',
        background: active ? 'var(--card)' : 'transparent',
        color: active ? '#ffffff' : 'var(--muted-foreground)',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.color = '#ffffff'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)'; } }}
    >
      <span style={{ color: active ? '#7c3aed' : 'inherit', display: 'flex' }}>{icon}</span>
      {label}
    </Link>
  );
}

// ── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px' }}>
      <div style={{
        width: 32, height: 32,
        background: 'rgba(124,58,237,0.15)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#7c3aed',
      }}>
        <IconCode />
      </div>
      <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em', color: '#ffffff' }}>
        CodeSense AI
      </span>
    </div>
  );
}

// ── DashboardLayout ──────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{
        width: 224,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0d12',
        borderRight: '1px solid var(--border)',
      }}>
        <Logo />

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '16px 12px' }}>
          <NavLink to="/dashboard" label="Dashboard" icon={<IconDashboard />} exact />
          <NavLink to="/dashboard"   label="Reviews"   icon={<IconReviews />} />
        </nav>

        <div style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border)',
          padding: '16px',
          fontSize: '12px',
          color: 'var(--muted-foreground)',
        }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color = '#ffffff'}
            onMouseLeave={e => e.target.style.color = 'var(--muted-foreground)'}
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}