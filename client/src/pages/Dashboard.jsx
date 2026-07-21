import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { fetchAllReviews, fetchStats, deleteReview } from '../api/reviews.js';
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

const IconTrash = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

export default function Dashboard() {
  const [reviews, setReviews]         = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [ctxMenu, setCtxMenu]         = useState(null); // { x, y, review }
  const [confirmReview, setConfirm]   = useState(null); // review object
  const [deleteLoading, setDeleting]  = useState(false);
  const ctxRef = useRef(null);

  // Socket
  const { connected, on, off } = useSocket();

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const [reviewsData, statsData] = await Promise.all([
          fetchAllReviews(),
          fetchStats(),
        ]);
        setReviews(reviewsData);
        setStats(statsData);
      } catch {
        setError('Could not connect to server. Is it running?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Real-time new review
  const handleNewReview = useCallback((newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setStats(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        totalReviews: prev.totalReviews + 1,
        passedReview: newReview.passed ? prev.passedReview + 1 : prev.passedReview,
        failedReview: !newReview.passed ? prev.failedReview + 1 : prev.failedReview,
      };
    });
  }, []);

  useEffect(() => {
    on('review:complete', handleNewReview);
    return () => off('review:complete', handleNewReview);
  }, [on, off, handleNewReview]);

  // Close context menu on outside click / scroll
  useEffect(() => {
    const close = () => setCtxMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
    };
  }, []);

  // Right-click handler
  function handleContextMenu(e, r) {
    e.preventDefault();
    e.stopPropagation();
    // Keep menu inside viewport
    const menuW = 190, menuH = 48;
    const x = Math.min(e.clientX, window.innerWidth - menuW - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuH - 8);
    setCtxMenu({ x, y, review: r });
  }

  // Delete handler
  async function handleDelete() {
    if (!confirmReview) return;
    setDeleting(true);
    try {
      await deleteReview(confirmReview._id);

      setReviews(prev => prev.filter(r => r._id !== confirmReview._id));
      setStats(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          totalReviews: Math.max(0, prev.totalReviews - 1),
          passedReview: confirmReview.passed ? Math.max(0, prev.passedReview - 1) : prev.passedReview,
          failedReview: !confirmReview.passed ? Math.max(0, prev.failedReview - 1) : prev.failedReview,
        };
      });

      setConfirm(null);
    } catch {
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: 0 }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: connected ? '#22c55e' : '#f85149', display: 'inline-block',
            }} />
            <span style={{ fontSize: 11, color: connected ? '#22c55e' : '#f85149', fontWeight: 500 }}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 32 }}>
          Recent AI reviews across all your repositories.{' '}
          <span style={{ opacity: 0.6 }}>Right-click a review to delete it.</span>
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
                borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--card)', padding: '16px 20px', transition: 'border-color 0.3s',
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
        {loading && <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: 40 }}>Loading reviews…</p>}
        {error && <p style={{ color: 'var(--danger)', textAlign: 'center', padding: 40 }}>{error}</p>}
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
              onContextMenu={e => handleContextMenu(e, r)}
              style={{
                display: 'block', borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                padding: '16px 20px',
                textDecoration: 'none',
                marginBottom: 8,
                transition: 'border-color 0.15s',
                userSelect: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace' }}>#{r.prNumber}</span>{' • '}{r.repoName}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{r.prTitle}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>by {r.author} · {timeAgo(r.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{
                    borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600,
                    background: passed ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)',
                    color: passed ? 'var(--success)' : 'var(--danger)',
                  }}>{r.score?.overall}</span>
                  <span style={{
                    borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    border: `1px solid ${passed ? 'rgba(63,185,80,0.4)' : 'rgba(248,81,73,0.4)'}`,
                    color: passed ? 'var(--success)' : 'var(--danger)',
                  }}>{passed ? 'Pass' : 'Fail'}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Context Menu ─────────────────────────────────────────────────────── */}
      {ctxMenu && (
        <div
          ref={ctxRef}
          id="review-context-menu"
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: ctxMenu.y,
            left: ctxMenu.x,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #1a1f2e, #161b22)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            minWidth: 190,
            padding: '5px',
            animation: 'ctxFadeIn 0.1s ease-out',
          }}
        >
          <button
            id="ctx-delete-review-btn"
            onClick={() => { setConfirm(ctxMenu.review); setCtxMenu(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '9px 12px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: '#f85149',
              fontFamily: 'inherit', borderRadius: 6,
              transition: 'background 0.12s',
              textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,81,73,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <IconTrash size={14} />
            Delete Review
          </button>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      {confirmReview && (
        <div
          id="delete-confirm-overlay"
          onClick={() => !deleteLoading && setConfirm(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'overlayFade 0.15s ease-out',
          }}
        >
          <div
            id="delete-confirm-modal"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1a1f2e 0%, #161b22 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '28px',
              maxWidth: 440, width: '90%',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              animation: 'modalSlideUp 0.18s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(248,81,73,0.1)',
              border: '1px solid rgba(248,81,73,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}>
              <IconTrash size={22} />
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Delete this review?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.65, marginBottom: 8 }}>
              You're about to permanently delete:
            </p>
            <p style={{
              fontSize: 13, color: '#fff', fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', borderRadius: 8,
              padding: '10px 14px', marginBottom: 24,
              border: '1px solid rgba(255,255,255,0.07)',
              lineHeight: 1.5,
            }}>
              {confirmReview.prTitle}
              <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--muted-foreground)', marginTop: 3, fontFamily: 'monospace' }}>
                #{confirmReview.prNumber} · {confirmReview.repoName}
              </span>
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 24, opacity: 0.7 }}>
              This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              {/* Cancel */}
              <button
                id="delete-cancel-btn"
                onClick={() => !deleteLoading && setConfirm(null)}
                disabled={deleteLoading}
                style={{
                  padding: '9px 20px', borderRadius: 9,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
              >
                Cancel
              </button>

              {/* Confirm Delete */}
              <button
                id="delete-confirm-btn"
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  padding: '9px 20px', borderRadius: 9,
                  border: 'none',
                  background: deleteLoading ? 'rgba(248,81,73,0.45)' : 'linear-gradient(135deg,#f85149,#dc2626)',
                  color: '#fff',
                  fontSize: 13, fontWeight: 600,
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'opacity 0.15s',
                  boxShadow: deleteLoading ? 'none' : '0 4px 16px rgba(248,81,73,0.3)',
                }}
                onMouseEnter={e => { if (!deleteLoading) e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {deleteLoading ? (
                  <>
                    <span style={{
                      width: 13, height: 13, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Deleting…
                  </>
                ) : (
                  <>
                    <IconTrash size={13} />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes spin         { to { transform: rotate(360deg); } }
        @keyframes ctxFadeIn    { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
        @keyframes overlayFade  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </DashboardLayout>
  );
}