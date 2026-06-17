import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { fetchReviewById } from '../api/reviews.js';

const SEVERITY = {
  CRITICAL:   { bg: 'rgba(248,81,73,0.12)',  text: 'var(--danger)',  border: 'rgba(248,81,73,0.4)' },
  WARNING:    { bg: 'rgba(210,153,34,0.12)', text: 'var(--warning)', border: 'rgba(210,153,34,0.4)' },
  SUGGESTION: { bg: 'rgba(88,166,255,0.12)', text: 'var(--info)',    border: 'rgba(88,166,255,0.4)' },
};

export default function ReviewDetail() {
  const { id } = useParams();
  const [review,  setReview]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchReviewById(id)
      .then(setReview)
      .catch(() => setError('Review not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><p style={{ padding: 40, color: 'var(--muted-foreground)' }}>Loading…</p></DashboardLayout>;
  if (error)   return <DashboardLayout><p style={{ padding: 40, color: 'var(--danger)' }}>{error}</p></DashboardLayout>;

  const passed = review.passed;
  const scoreColor = passed ? 'var(--success)' : 'var(--danger)';

  return (
    <DashboardLayout>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

        <Link to="/dashboard" style={{ color: 'var(--muted-foreground)', textDecoration: 'none', fontSize: 13 }}>
          ← Back to dashboard
        </Link>

        <div style={{ margin: '20px 0' }}>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 6 }}>
            <span style={{ fontFamily: 'monospace' }}>#{review.prNumber}</span> • {review.repoName}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{review.PrTitle}</h1>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>by {review.author}</p>
        </div>

        {/* Score panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ borderRadius: 14, border: `2px solid ${passed ? 'rgba(63,185,80,0.5)' : 'rgba(248,81,73,0.5)'}`, background: 'var(--card)', padding: '24px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>Overall</div>
            <div style={{ fontSize: 52, fontWeight: 700, color: scoreColor }}>{review.score?.overall}</div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: scoreColor, marginTop: 6 }}>{passed ? 'Pass' : 'Fail'}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Security', review.score?.security], ['Performance', review.score?.performance], ['Quality', review.score?.quality], ['Tests', review.score?.tests]].map(([label, val]) => (
              <div key={label} style={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: val >= 70 ? 'var(--success)' : 'var(--danger)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <section style={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: 10 }}>AI Summary</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--foreground)' }}>{review.summary}</p>
        </section>

        {/* Issues */}
        {review.issues?.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Issues ({review.issues.length})</h2>
            {review.issues.map((issue, i) => {
              const sev = SEVERITY[(issue.severity || 'SUGGESTION').toUpperCase()] ?? SEVERITY.SUGGESTION;
              return (
                <article key={i} style={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', padding: '16px 20px', marginBottom: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'start', marginBottom: 12 }}>
                    <span style={{ borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}>
                      {issue.severity}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{issue.title}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted-foreground)' }}>{issue.file}:{issue.line}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--foreground)', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>Problem: </span>{issue.description}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--foreground)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>Fix: </span>{issue.fix}
                  </p>
                </article>
              );
            })}
          </section>
        )}

        {/* Positives — NOTE: schema field is "positive" not "positives" */}
        {review.positive?.length > 0 && (
          <section>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 12 }}>What's Working Well</h2>
            <ul style={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', padding: '16px 20px', listStyle: 'none' }}>
              {review.positive.map((p, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--foreground)', marginBottom: 8 }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> {p}
                </li>
              ))}
            </ul>
          </section>
        )}

      </main>
    </DashboardLayout>
  );
}