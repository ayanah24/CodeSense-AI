import { useState } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ScoreCell from '../components/ScoreCell.jsx';
import { manualReview } from '../api/reviews.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python'     },
  { value: 'java',       label: 'Java'       },
  { value: 'cpp',        label: 'C++'        },
  { value: 'go',         label: 'Go'         },
  { value: 'rust',       label: 'Rust'       },
  { value: 'php',        label: 'PHP'        },
];

const SEVERITY_META = {
  critical:   { color: '#f85149', bg: 'rgba(248,81,73,0.08)',   label: 'CRITICAL'   },
  warning:    { color: '#d29922', bg: 'rgba(210,153,34,0.08)',  label: 'WARNING'    },
  suggestion: { color: '#58a6ff', bg: 'rgba(88,166,255,0.08)', label: 'SUGGESTION' },
};

const defaultCode = `// Paste your code here and click "Review Code"\nasync function login(req, res) {\n  const user = await User.findOne({ email: req.body.email });\n  const token = jwt.sign({ id: user._id }, 'hardcoded-secret');\n  res.json({ token, user });\n}`;

// ── Small icon components ─────────────────────────────────────────────────────
const IconCode = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <polyline points="9 18 3 12 9 6" /><polyline points="15 6 21 12 15 18" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,13,18,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(124,58,237,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#7c3aed',
        }}>
          <IconCode />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
          CodeSense AI
        </span>
      </Link>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{
          fontSize: 13, fontWeight: 600, color: '#fff',
          padding: '6px 12px', borderRadius: 6,
          background: 'rgba(124,58,237,0.2)',
          border: '1px solid rgba(124,58,237,0.35)',
        }}>
          Manual Review
        </span>
      </nav>
    </header>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ManualReview() {
  const [code,    setCode]    = useState(defaultCode);
  const [lang,    setLang]    = useState('javascript');
  const [review,  setReview]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  async function handleReview() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setReview(null);
    try {
      const result = await manualReview(code, lang);
      setReview(result);
    } catch (err) {
      setError('Review failed — please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Page content */}
      <div style={{ flex: 1, padding: '40px 24px 80px', maxWidth: 860, width: '100%', margin: '0 auto' }}>

        {/* ── Hero header ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Manual Code Review
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 6, lineHeight: 1.6 }}>
            Paste any snippet and get an instant AI review — security, performance, quality &amp; tests.
          </p>
        </div>

        {/* ── Editor card ── */}
        <div style={{
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            background: '#0d1117',
          }}>
            {/* Language selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 500 }}>Language</span>
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                style={{
                  fontSize: 12, fontWeight: 500,
                  background: 'var(--muted)', color: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 6, padding: '4px 10px',
                  cursor: 'pointer', outline: 'none',
                  fontFamily: 'inherit',
                }}
              >
                {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            {/* Review button */}
            <button
              id="btn-review-code"
              onClick={handleReview}
              disabled={loading || !code.trim()}
              style={{
                fontSize: 13, fontWeight: 600,
                padding: '7px 18px', borderRadius: 7,
                border: 'none', cursor: 'pointer',
                background: loading ? 'var(--muted)' : 'linear-gradient(135deg,#7c3aed,#6366f1)',
                color: '#fff',
                opacity: !code.trim() ? 0.5 : 1,
                transition: 'opacity 0.2s, transform 0.1s',
                display: 'flex', alignItems: 'center', gap: 6,
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Analyzing…
                </>
              ) : 'Review Code →'}
            </button>
          </div>

          {/* Monaco Editor */}
          <Editor
            height="360px"
            language={lang}
            value={code}
            onChange={val => setCode(val || '')}
            theme="vs-dark"
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              wordWrap: 'on',
              padding: { top: 14, bottom: 14 },
              renderLineHighlight: 'line',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
            }}
          />
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div style={{
            borderRadius: 8, border: '1px solid var(--danger)',
            background: 'rgba(248,81,73,0.08)',
            padding: '12px 16px', marginBottom: 20,
            fontSize: 13, color: 'var(--danger)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>⚠</span> {error}
          </div>
        )}

        {/* ── Loading shimmer ── */}
        {loading && (
          <div style={{
            borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--card)', padding: '32px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid var(--border)',
              borderTopColor: '#7c3aed',
              margin: '0 auto 14px',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: 14, color: 'var(--muted-foreground)', fontWeight: 500 }}>
              Analyzing your code with AI…
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4, opacity: 0.7 }}>
              This may take a few seconds
            </p>
          </div>
        )}

        {/* ── Review results ── */}
        {review && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Score card */}
            <div style={{
              borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--card)', padding: '20px 24px',
            }}>
              {/* Overall score row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Overall Score
                  </p>
                  <p style={{
                    fontSize: 56, fontWeight: 800, lineHeight: 1,
                    color: review.score.overall >= 70 ? 'var(--success)' : 'var(--danger)',
                    letterSpacing: '-0.03em',
                  }}>
                    {review.score.overall}
                  </p>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '4px 10px',
                  borderRadius: 6, border: '1px solid',
                  alignSelf: 'flex-end', marginBottom: 4,
                  ...(review.passed
                    ? { color: 'var(--success)', borderColor: 'var(--success)', background: 'rgba(63,185,80,0.1)' }
                    : { color: 'var(--danger)',  borderColor: 'var(--danger)',  background: 'rgba(248,81,73,0.1)' }),
                }}>
                  {review.passed ? '✓ Pass' : '✗ Fail'}
                </span>
              </div>

              {/* Sub-scores */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <ScoreCell label="Security"    value={review.score.security}    />
                <ScoreCell label="Performance" value={review.score.performance} />
                <ScoreCell label="Quality"     value={review.score.quality}     />
                <ScoreCell label="Tests"       value={review.score.tests}       />
              </div>
            </div>

            {/* AI Summary */}
            <div style={{
              borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--card)', padding: '20px 24px',
            }}>
              <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)', marginBottom: 10 }}>
                AI Summary
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--foreground)' }}>
                {review.summary}
              </p>
            </div>

            {/* Issues */}
            {review.issues?.length > 0 && (
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
                  Issues
                  <span style={{
                    marginLeft: 8, fontSize: 11, fontWeight: 600,
                    padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(248,81,73,0.12)', color: 'var(--danger)',
                  }}>
                    {review.issues.length}
                  </span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {review.issues.map((issue, i) => {
                    const sev = SEVERITY_META[(issue.severity || 'suggestion').toLowerCase()] || SEVERITY_META.suggestion;
                    return (
                      <article key={i} style={{
                        borderRadius: 10,
                        border: `1px solid var(--border)`,
                        borderLeft: `3px solid ${sev.color}`,
                        background: 'var(--card)',
                        padding: '16px 20px',
                      }}>
                        {/* Header row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                          <span style={{
                            flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                            padding: '3px 8px', borderRadius: 4,
                            color: sev.color, background: sev.bg, border: `1px solid ${sev.color}`,
                          }}>
                            {sev.label}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                              {issue.title}
                            </h3>
                            {(issue.file || issue.line) && (
                              <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--muted-foreground)', marginTop: 3 }}>
                                {issue.file}{issue.line ? `:${issue.line}` : ''}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Body */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, lineHeight: 1.6 }}>
                          <p>
                            <span style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>Problem: </span>
                            <span style={{ color: 'var(--foreground)' }}>{issue.description}</span>
                          </p>
                          <p>
                            <span style={{ fontWeight: 600, color: 'var(--success)' }}>Fix: </span>
                            <span style={{ color: 'var(--foreground)' }}>{issue.fix}</span>
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Positives */}
            {review.positives?.length > 0 && (
              <div style={{
                borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--card)', padding: '20px 24px',
              }}>
                <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)', marginBottom: 12 }}>
                  What's Working Well
                </h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}>
                  {review.positives.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--foreground)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--success)', marginTop: 2, flexShrink: 0 }}><IconCheck /></span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}