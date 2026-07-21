import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// ── Icons ────────────────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
  </svg>
);

const IconCode = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <polyline points="9 18 3 12 9 6" /><polyline points="15 6 21 12 15 18" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconRepo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── NavLink ──────────────────────────────────────────────────────────────────
function NavLink({ to, label, icon, exact = false, onClick }) {
  const { pathname } = useLocation();
  const active = exact ? pathname === to : pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 12px', borderRadius: '6px',
        fontSize: '13px', fontWeight: 500, textDecoration: 'none',
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
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>CodeSense AI</Link>
      </span>
    </div>
  );
}

// ── UserPanel ─────────────────────────────────────────────────────────────────
function UserPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  if (!user) return null;

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            style={{
              width: 30, height: 30,
              borderRadius: '50%',
              border: '1px solid rgba(124,58,237,0.35)',
              flexShrink: 0,
            }}
          />
        ) : (
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(124,58,237,0.20)',
            border: '1px solid rgba(124,58,237,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#a78bfa',
            flexShrink: 0,
          }}>
            {user.username?.slice(0, 2).toUpperCase() ?? 'U'}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: '#ffffff',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user.username ?? 'User'}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 600,
            color: user.role === 'admin' ? '#f59e0b' : '#a78bfa',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {user.role}
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px', borderRadius: 6,
          fontSize: 12, fontWeight: 500,
          color: 'var(--muted-foreground)',
          background: 'transparent',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(248,81,73,0.08)';
          e.currentTarget.style.color = '#f85149';
          e.currentTarget.style.borderColor = 'rgba(248,81,73,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--muted-foreground)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <IconLogout />
        Sign out
      </button>
    </div>
  );
}

// ── Sidebar content ───────────────────────────────────────────────────────────
function SidebarContent({ onNavClick }) {
  return (
    <>
      <Logo />
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '16px 12px', flex: 1 }}>
        <NavLink to="/dashboard"    label="Dashboard"    icon={<IconDashboard />} exact onClick={onNavClick} />
        <NavLink to="/repositories" label="Repositories" icon={<IconRepo />}      onClick={onNavClick} />
        <NavLink to="/api-keys"     label="API Keys"     icon={<IconKey />}       onClick={onNavClick} />
      </nav>
      <div style={{ marginTop: 'auto' }}>
        <UserPanel />
      </div>
    </>
  );
}

// ── DashboardLayout ──────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Mobile top-bar (hidden on desktop via CSS) ── */}
      <div className="dashboard-topbar">
        {/* Hamburger */}
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <span /><span /><span />
        </button>

        {/* Logo inline */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'rgba(124,58,237,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#7c3aed',
          }}>
            <IconCode />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
            CodeSense AI
          </span>
        </Link>

        {/* Spacer */}
        <div style={{ width: 36 }} />
      </div>

      {/* ── Body row (sidebar + main) ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── Overlay (mobile) ── */}
        {sidebarOpen && (
          <div
            className="mobile-nav-overlay"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`dashboard-sidebar${sidebarOpen ? ' is-open' : ''}`}
          style={{
            width: 'var(--sidebar-width)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: '#0a0d12',
            borderRight: '1px solid var(--border)',
            // Desktop: static position (CSS overrides to fixed on mobile)
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          {/* Close button (mobile only) */}
          <button
            onClick={closeSidebar}
            aria-label="Close navigation"
            style={{
              display: 'none', // shown via CSS on mobile
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(255,255,255,0.06)', border: 'none',
              borderRadius: 6, color: '#8b949e', cursor: 'pointer',
              width: 32, height: 32,
              alignItems: 'center', justifyContent: 'center',
            }}
            className="sidebar-close-btn"
          >
            <IconClose />
          </button>

          <SidebarContent onNavClick={closeSidebar} />
        </aside>

        {/* ── Main content ── */}
        <div
          className="dashboard-main"
          style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
        >
          <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
        </div>
      </div>

      {/* Sidebar close button visibility on mobile */}
      <style>{`
        @media (max-width: 767px) {
          .sidebar-close-btn { display: flex !important; }
          .dashboard-sidebar {
            position: fixed !important;
            top: 0 !important;
            height: 100vh !important;
          }
        }
      `}</style>
    </div>
  );
}