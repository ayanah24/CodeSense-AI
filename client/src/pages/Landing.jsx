import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const features = [
  { icon: '🧠', title: 'Focused, multi-agent analysis', desc: 'Specialist agents examine security, logic, and code quality in parallel, surfacing focused findings instead of generic feedback.' },
  { icon: '📊', title: 'Consistent review scores', desc: 'See security, performance, quality, and test coverage alongside an overall score to compare review outcomes.' },
  { icon: '🔍', title: 'Repository-aware feedback', desc: 'Code retrieval adds relevant repository context, helping findings account for existing patterns and surrounding code.' },
  { icon: '⚡', title: 'Live review status', desc: 'Track submitted reviews from your dashboard and see results arrive without repeatedly refreshing the page.' },
  { icon: '📋', title: 'On-demand code review', desc: 'Review a snippet without connecting a repository. Get structured findings and practical suggestions in the manual editor.' },
  { icon: '🔗', title: 'Pipeline-ready API', desc: 'Submit code for review from your CI/CD workflow using API keys, then retrieve scored results asynchronously.' },
  { icon: '🔒', title: 'Configurable merge gates', desc: 'Use GitHub commit status checks to flag pull requests that fall below your configured review threshold.' },
  { icon: '💬', title: 'Findings in pull requests', desc: 'See review summaries, severity, and suggested fixes directly in your pull request discussion.' },
];

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Logo() {
  return (
    <Link to="/" className="landing-brand" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
      <div className="landing-brand-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
          <polyline points="9 18 3 12 9 6" /><polyline points="15 6 21 12 15 18" />
        </svg>
      </div>
      <span className="landing-brand-name" style={{ fontSize: '15px', fontWeight: 600, color: '#0f0f0f', letterSpacing: '-0.01em' }}>
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
  const [user, setUser] = useState(null);   // null = not checked, false = not logged in
  const [navOpen, setNavOpen] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data || false))
      .catch(() => setUser(false));
  }, []);

  // Login — redirect browser to OAuth start
  function handleLogin() {
    window.location.href = `${API}/auth/github`;
  }

  // Logout — call API then refresh
  async function handleLogout() {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(false);
  }

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: '#ffffff', color: '#0f0f0f', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="landing-header" style={{
        position: 'sticky', top: 0, zIndex: 20,
        borderBottom: '1px solid rgba(226,232,240,0.7)',
        background: 'rgba(255,255,255,0.85)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />

          {/* Desktop nav links */}
          <nav className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[['#how', 'How it works'], ['#features', 'Features']].map(([href, label]) => (
              <a key={href} href={href} className="landing-nav-item"
                onClick={() => setNavOpen(false)}
                style={{ fontSize: navOpen ? '20px' : '14px', fontWeight: 500, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#0f0f0f'}
                onMouseLeave={e => e.target.style.color = '#64748b'}
              >
                {label}
              </a>
            ))}
            <Link to="/docs" className="landing-nav-item"
              onClick={() => setNavOpen(false)}
              style={{ fontSize: navOpen ? '20px' : '14px', fontWeight: 600, color: '#374151', textDecoration: 'none' }}>
              Docs
            </Link>
            <Link to="/manual" className="landing-nav-item landing-nav-manual"
              onClick={() => setNavOpen(false)}
              style={{ fontSize: navOpen ? '20px' : '14px', fontWeight: 500, color: '#7c3aed', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.target.style.color = '#6d28d9'}
              onMouseLeave={e => e.target.style.color = '#7c3aed'}
            >
              Manual Review
            </Link>
            {navOpen && (
              user ? (
                <Link to="/dashboard" onClick={() => setNavOpen(false)}
                  style={{ fontSize: '20px', fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>
                  Dashboard
                </Link>
              ) : (
                <button onClick={() => { setNavOpen(false); handleLogin(); }}
                  style={{ fontSize: '18px', fontWeight: 600, background: '#111827', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, cursor: 'pointer' }}>
                  Login with GitHub
                </button>
              )
            )}
          </nav>

          {/* Right side — desktop only */}
          <div className="landing-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger — shown on mobile via CSS */}
            <button
              className="landing-hamburger"
              onClick={() => setNavOpen(o => !o)}
              aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={navOpen}
            >
              <span style={{ transform: navOpen ? 'rotate(45deg) translate(5px,5px)' : 'none', transition: 'transform 0.2s' }} />
              <span style={{ opacity: navOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
              <span style={{ transform: navOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Desktop login/logout — hide on mobile when nav is open */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link to="/dashboard" style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>
                  Dashboard
                </Link>
                <button className="landing-auth-button"
                  onClick={handleLogout}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: '#fff', color: '#374151',
                    padding: '8px 16px', borderRadius: 9,
                    fontSize: '13px', fontWeight: 500,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button className="landing-auth-button"
                onClick={handleLogin}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: '#111827', color: '#ffffff',
                  padding: '8px 16px', borderRadius: 9,
                  fontSize: '13px', fontWeight: 500,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#374151'}
                onMouseLeave={e => e.currentTarget.style.background = '#111827'}
              >
                <GithubIcon />
                Login with GitHub
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav overlay class toggling */}
      <style>{`
        @media (max-width: 767px) {
          .landing-nav-links { display: ${navOpen ? 'flex' : 'none'} !important; }
        }
      `}</style>

      {/* Hero */}
      <section className="landing-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="landing-hero-wash" style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.09) 0%, transparent 70%)',
        }} />

        <div className="landing-hero-content" style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '96px 24px 88px', textAlign: 'center' }}>

          <div className="landing-announcement" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 999, padding: '5px 14px',
            fontSize: '12px', fontWeight: 500, color: '#64748b',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 32,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
            GitHub merge checks · Now available
          </div>

          <h1 className="landing-title" style={{
            fontSize: 'clamp(38px, 6vw, 62px)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.03em', color: '#0f0f0f',
            marginBottom: 22,
          }}>
            Ship better code with{' '}
            <span className="gradient-text">feedback you can act on.</span>
          </h1>

          <p style={{ fontSize: '17px', color: '#64748b', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
            Review pull requests for security, quality, and performance, with clear findings delivered to your dashboard and GitHub.
          </p>

          {/* CTA — goes to dashboard if logged in, triggers OAuth if not */}
          {user ? (
            <Link className="landing-primary-cta"
              to="/dashboard"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#7c3aed', color: '#ffffff',
                padding: '13px 28px', borderRadius: 10,
                fontSize: '15px', fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(124,58,237,0.30)',
                transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#6d28d9'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#7c3aed'; }}
            >
              Go to Dashboard <ArrowRight />
            </Link>
          ) : (
            <button className="landing-primary-cta"
              onClick={handleLogin}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#7c3aed', color: '#ffffff',
                padding: '13px 28px', borderRadius: 10,
                fontSize: '15px', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(124,58,237,0.30)',
                transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#6d28d9'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#7c3aed'; }}
            >
              <GithubIcon />
              Start Reviewing for Free <ArrowRight />
            </button>
          )}

          {/* Built with Logos Row */}
          <div className="landing-stack" style={{ marginTop: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Built with</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', rowGap: 8 }}>
              {[
                { icon: '🦙', text: 'LangGraph Agents' },
                { icon: '✦', text: 'Gemini 2.5 Flash' },
                { icon: '🤖', text: 'Groq Llama-3.3' },
                { icon: '🌲', text: 'Pinecone RAG' },
                { icon: '⚡', text: 'BullMQ + Redis' },
              ].map((item, idx) => (
                <span
                  key={idx}
                  className="landing-stack-chip"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: 'rgba(248, 250, 252, 0.6)',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default',
                    userSelect: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                    e.currentTarget.style.color = '#7c3aed';
                    e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.2)';
                    e.currentTarget.style.background = 'rgba(124, 58, 237, 0.04)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                    e.currentTarget.style.background = 'rgba(248, 250, 252, 0.6)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*  How it works */}
      <section id="how" className="landing-how" style={{ borderTop: '1px solid #f1f5f9', background: 'rgba(248,250,252,0.6)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: '#0f0f0f', letterSpacing: '-0.02em', marginBottom: 10 }}>
              How it works
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b' }}>Connect a repository once, then get contextual reviews as you work through pull requests.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
            {[
              { n: 1, title: 'Connect GitHub', desc: 'Sign in securely and select the repositories you want CodeSense AI to review.' },
              { n: 2, title: 'Build repository context', desc: 'CodeSense AI indexes your codebase so reviews can consider relevant project patterns alongside each change.' },
              { n: 3, title: 'Open a pull request', desc: 'Submit changes through your normal workflow and let the repository integration start a review.' },
              { n: 4, title: 'Review clear findings', desc: 'Explore scored results in your dashboard and pull request, with merge checks set to your preferred threshold.' },
            ].map((s) => (
              <div key={s.n} className="landing-step"
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '24px', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(124,58,237,0.10)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, marginBottom: 16 }}>
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
      <section id="features" className="landing-features" style={{ borderTop: '1px solid #f1f5f9', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: '#0f0f0f', letterSpacing: '-0.02em', marginBottom: 10 }}>
              A clearer signal in every code review
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b' }}>Consistent analysis, repository context, and actionable results across the tools you already use.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {features.map((f) => (
              <div key={f.title} className="landing-feature"
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '22px', transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s' }}
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

      {/* Manual Review callout */}
      <section id="try-free" className="landing-manual" style={{ borderTop: '1px solid #f1f5f9', padding: '80px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <div className="landing-manual-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#7c3aed', marginBottom: 20 }}>
              ✦ No GitHub needed
            </div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,36px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f0f0f', lineHeight: 1.15, marginBottom: 16 }}>
              Review code without connecting GitHub
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.75, marginBottom: 32, maxWidth: 400 }}>
              Evaluate a function, investigate a concern, or get a second opinion without connecting a repository. Paste a snippet for structured feedback on security, performance, quality, and tests.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
              {[{ icon: '🛡️', text: 'Security scan' }, { icon: '⚡', text: 'Performance check' }, { icon: '✨', text: 'Quality score' }, { icon: '🧪', text: 'Test coverage review' }].map(f => (
                <span key={f.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#374151', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px' }}>
                  {f.icon} {f.text}
                </span>
              ))}
            </div>
            <Link className="landing-manual-cta" to="/manual" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#7c3aed,#6366f1)', color: '#fff', padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(124,58,237,0.28)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.40)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.28)'; }}
            >
              Try Manual Review Free <ArrowRight />
            </Link>
          </div>
          <div className="landing-editor-preview" style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #30363d', background: '#161b22' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f85149', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d29922', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3fb950', display: 'inline-block' }} />
              </div>
              <span style={{ fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>manual-review.js</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#3fb950', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)', padding: '2px 8px', borderRadius: 4 }}>Score: 72</span>
            </div>
            <pre style={{ margin: 0, padding: '18px 20px', fontSize: 12, lineHeight: 1.75, fontFamily: "'JetBrains Mono','Fira Code',monospace", color: '#c9d1d9', overflowX: 'auto' }}>
              <code>{`async function login(req, res) {\n  const user = await User.findOne({\n    email: req.body.email\n  });\n  `}<span style={{ color: '#f85149' }}>{`// ⚠ Hardcoded secret — critical`}</span>{`\n  const token = jwt.sign(\n    { id: user._id },\n    `}<span style={{ color: '#f85149' }}>{`'hardcoded-secret'`}</span>{`\n  );\n  res.json({ token, user });\n}`}</code>
            </pre>
            <div style={{ margin: '0 16px 16px', padding: '10px 14px', borderRadius: 8, background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.25)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: '#f85149', background: 'rgba(248,81,73,0.15)', border: '1px solid rgba(248,81,73,0.4)', padding: '2px 7px', borderRadius: 4, flexShrink: 0, marginTop: 1 }}>CRITICAL</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>Hardcoded JWT secret</p>
                <p style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.5 }}>Move to <code style={{ color: '#58a6ff' }}>process.env.JWT_SECRET</code> to prevent key exposure.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="landing-final-cta" style={{ borderTop: '1px solid #f1f5f9', background: 'rgba(248,250,252,0.6)', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, color: '#0f0f0f', letterSpacing: '-0.02em', marginBottom: 24 }}>
            Make your next code review more useful.
          </h2>
          {user ? (
            <Link to="/dashboard"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111827', color: '#ffffff', padding: '13px 32px', borderRadius: 10, fontSize: '15px', fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Open the dashboard
            </Link>
          ) : (
            <button onClick={handleLogin}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111827', color: '#ffffff', padding: '13px 32px', borderRadius: 10, fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.15s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Open the dashboard
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Logo />
          <Link to="/docs" style={{ color: '#64748b', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Documentation</Link>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>© 2026 CodeSense AI</p>
        </div>
      </footer>

    </div>
  );
}
