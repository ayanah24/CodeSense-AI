import { Link } from 'react-router-dom';

const features = [
  { icon: '🐞', title: 'Bug Detection',         desc: 'Catches logic errors, null derefs, and off-by-ones before review.' },
  { icon: '🛡️', title: 'Security Scanning',     desc: 'Flags injection, auth gaps, and unsafe patterns by default.' },
  { icon: '⚡', title: 'Performance Analysis',  desc: 'Spots N+1 queries, blocking I/O, and inefficient algorithms.' },
  { icon: '✨', title: 'Code Quality',           desc: 'Enforces conventions, surfaces dead code, and recommends refactors.' },
  { icon: '🔒', title: 'Merge Gate Protection', desc: 'Block PRs below your score threshold from being merged.' },
  { icon: '📊', title: 'Real-time Dashboard',   desc: 'See every review across every repo in one organized view.' },
];

//logo
function Logo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
      <div style={{
        width: 32, height: 32,
        background: 'rgba(124,58,237,0.12)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#7c3aed',
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
          <polyline points="9 18 3 12 9 6" /><polyline points="15 6 21 12 15 18" />
        </svg>
      </div>
      <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f0f0f', letterSpacing: '-0.01em' }}>
        CodeSense AI
      </span>
    </Link>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.48.11-3.08 0 0 .98-.31 3.2 1.18a11.07 11.07 0 0 1 5.83 0c2.22-1.5 3.2-1.18 3.2-1.18.63 1.6.23 2.78.11 3.08.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.13v3.16c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f0f0f', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        borderBottom: '1px solid rgba(226,232,240,0.7)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />

          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[['#how', 'How it works'], ['#features', 'Features']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#0f0f0f'}
                onMouseLeave={e => e.target.style.color = '#64748b'}
              >
                {label}
              </a>
            ))}
          </nav>

          <Link
            to="/dashboard"
            id="nav-github-login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: '#111827', color: '#ffffff',
              padding: '8px 16px', borderRadius: 9,
              fontSize: '13px', fontWeight: 500,
              textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#374151'}
            onMouseLeave={e => e.currentTarget.style.background = '#111827'}
          >
            <GithubIcon />
            Login with GitHub
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.09) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '96px 24px 88px', textAlign: 'center' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 999, padding: '5px 14px',
            fontSize: '12px', fontWeight: 500, color: '#64748b',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 32,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
            New — Merge gate protection is live
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 62px)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.03em', color: '#0f0f0f',
            marginBottom: 22,
          }}>
            AI Code Reviews That{' '}
            <span className="gradient-text">Actually Make Sense</span>
          </h1>

          {/* Sub */}
          <p style={{ fontSize: '17px', color: '#64748b', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
            Automated PR reviews powered by AI. Catches bugs, security issues,
            and bad practices before they hit production.
          </p>

          {/* CTA */}
          <Link
            to="/dashboard"
            id="hero-start-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#7c3aed', color: '#ffffff',
              padding: '13px 28px', borderRadius: 10,
              fontSize: '15px', fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(124,58,237,0.30)',
              transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.40)'; e.currentTarget.style.background = '#6d28d9'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.30)'; e.currentTarget.style.background = '#7c3aed'; }}
          >
            Start Reviewing for Free <ArrowRight />
          </Link>

        </div>
      </section>

      {/*  How it works */}
      <section id="how" style={{ borderTop: '1px solid #f1f5f9', background: 'rgba(248,250,252,0.6)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: '#0f0f0f', letterSpacing: '-0.02em', marginBottom: 10 }}>
              How it works
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b' }}>
              Three steps from install to your first review.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { n: 1, title: 'Connect your GitHub repo',  desc: 'Install the GitHub app and pick the repositories you want reviewed.' },
              { n: 2, title: 'Open a Pull Request',        desc: 'Push code and open a PR like you normally would — no extra commands.' },
              { n: 3, title: 'Get instant AI review',      desc: 'A detailed review appears within seconds, with severity-tagged findings.' },
            ].map((s) => (
              <div
                key={s.n}
                style={{
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14,
                  padding: '24px', transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgba(124,58,237,0.10)', color: '#7c3aed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, marginBottom: 16,
                }}>
                  {s.n}
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '15px', color: '#0f0f0f', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ borderTop: '1px solid #f1f5f9', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: '#0f0f0f', letterSpacing: '-0.02em', marginBottom: 10 }}>
              Everything in one review
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b' }}>
              Six analyzers running in parallel on every pull request.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {features.map((f) => (
              <div
                key={f.title}
                id={`feature-${f.title.replace(/\s+/g, '-').toLowerCase()}`}
                style={{
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '22px',
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '22px', marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 600, fontSize: '15px', color: '#0f0f0f', marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/*CTA strip */}
      <section style={{ borderTop: '1px solid #f1f5f9', background: 'rgba(248,250,252,0.6)', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, color: '#0f0f0f', letterSpacing: '-0.02em', marginBottom: 24 }}>
            Ready to ship safer code?
          </h2>
          <Link
            to="/dashboard"
            id="bottom-cta-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#111827', color: '#ffffff',
              padding: '13px 32px', borderRadius: 10,
              fontSize: '15px', fontWeight: 600, textDecoration: 'none',
              transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Open the dashboard
          </Link>
        </div>
      </section>

      {/*  Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Logo />
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>© 2026 CodeSense AI</p>
        </div>
      </footer>

    </div>
  );
}