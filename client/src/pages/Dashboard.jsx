import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { fetchAllReviews, fetchStats } from '../api/reviews.js';
import { useSocket } from '../hooks/useSocket.js';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'just now';
}

export default function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Socket
  const { connected, on, off } = useSocket();

  //  Load Data
  useEffect(() => {
    async function load() {
      try {
        const [reviewsData, statsData] = await Promise.all([
          fetchAllReviews(),
          fetchStats(),
        ]);
        setReviews(reviewsData);
        setStats(statsData);
      } catch (err) {
        setError('Could not connect to server. Is it running?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  //  Real-time handler
  const handleNewReview = useCallback((newReview) => {
    console.log('New review received via socket:', newReview);

    // Naya review top pe add karo
    setReviews(prev => [newReview, ...prev]);

    // Stats update karo
    setStats(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        totalReviews: prev.totalReviews + 1,
        passedReview: newReview.passed
          ? prev.passedReview + 1
          : prev.passedReview,
        failedReview: !newReview.passed
          ? prev.failedReview + 1
          : prev.failedReview,
      };
    });

  }, []);

  //Socket Event Listener
  useEffect(() => {
    on('review:complete', handleNewReview);

    return () => {
      off('review:complete', handleNewReview);
    };
  }, [on, off, handleNewReview]);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header + connection status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: 0 }}>
            Dashboard
          </h1>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: connected ? '#22c55e' : '#f85149',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 11, color: connected ? '#22c55e' : '#f85149', fontWeight: 500 }}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 32 }}>
          Recent AI reviews across all your repositories.
        </p>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Total Reviews', value: stats.totalReviews },
              { label: 'Average Score', value: stats.avgScore },
              { label: 'Passed', value: stats.passedReview, color: 'var(--success)' },
              { label: 'Failed', value: stats.failedReview, color: 'var(--danger)' },
            ].map(s => (
              <div key={s.label} style={{
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                padding: '16px 20px',
                transition: 'border-color 0.3s',
              }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-foreground)', marginBottom: 8 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: s.color ?? '#fff' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* States */}
        {loading && (
          <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: 40 }}>
            Loading reviews…
          </p>
        )}
        {error && (
          <p style={{ color: 'var(--danger)', textAlign: 'center', padding: 40 }}>
            {error}
          </p>
        )}
        {!loading && !error && reviews.length === 0 && (
          <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: 40 }}>
            No reviews yet. Open a PR on a connected repo to get started.
          </p>
        )}

        {/* Review rows */}
        {reviews.map(r => {
          const passed = r.passed;
          return (
            <Link
              key={r._id}
              to={`/reviews/${r._id}`}
              style={{
                display: 'block', borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                padding: '16px 20px',
                textDecoration: 'none',
                marginBottom: 8,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace' }}>#{r.prNumber}</span>
                    {' • '}
                    {r.repoName}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                    {r.prTitle}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                    by {r.author} · {timeAgo(r.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{
                    borderRadius: 999, padding: '4px 10px',
                    fontSize: 12, fontWeight: 600,
                    background: passed ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)',
                    color: passed ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {r.score?.overall}
                  </span>
                  <span style={{
                    borderRadius: 6, padding: '2px 8px',
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    border: `1px solid ${passed ? 'rgba(63,185,80,0.4)' : 'rgba(248,81,73,0.4)'}`,
                    color: passed ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {passed ? 'Pass' : 'Fail'}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardLayout>
  );
}