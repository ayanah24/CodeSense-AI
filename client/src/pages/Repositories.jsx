import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import AddRepoModal from '../components/AddRepoModal.jsx';
import { fetchConnectedRepos, disconnectRepo } from '../api/repos.js';

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconRepo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const IconWebhook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/>
    <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/>
    <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/>
  </svg>
);

// ── Repo Card ─────────────────────────────────────────────────────────────────
function RepoCard({ repo, onDisconnect }) {
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleDisconnect() {
    if (!window.confirm(`Disconnect ${repo.repoName}? Reviews will be preserved.`)) return;

    setDisconnecting(true);
    try {
      await disconnectRepo(repo._id);
      onDisconnect(repo._id);
    } catch (err) {
      alert('Failed to disconnect. Please try again.');
    } finally {
      setDisconnecting(false);
    }
  }
//show name and repo name
  const repoShortName = repo.repoName.split('/')[1] ?? repo.repoName;
  const repoOwner     = repo.repoName.split('/')[0] ?? '';

  return (
    <div style={{
      background:   '#0d1117',
      border:       '1px solid #30363d',
      borderRadius: 12,
      padding:      '20px 24px',
      transition:   'border-color 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>

        {/* Repo info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width:        36, height: 36,
            background:   'rgba(124,58,237,0.12)',
            borderRadius: 8,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            color:        '#7c3aed',
            flexShrink:   0,
          }}>
            <IconRepo />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#8b949e' }}>{repoOwner}/</span>
              <span style={{
                fontSize:     14,
                fontWeight:   600,
                color:        '#fff',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
              }}>
                {repoShortName}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              {/* Webhook active badge */}
              <span style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          4,
                fontSize:     10,
                fontWeight:   600,
                color:        '#3fb950',
                background:   'rgba(63,185,80,0.1)',
                border:       '1px solid rgba(63,185,80,0.25)',
                borderRadius: 4,
                padding:      '2px 7px',
              }}>
                <IconWebhook />
                Webhook Active
              </span>
              {/* Connected date */}
              <span style={{ fontSize: 11, color: '#8b949e' }}>
                Connected {new Date(repo.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Disconnect button */}
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          style={{
            fontSize:     12,
            fontWeight:   500,
            color:        disconnecting ? '#8b949e' : '#f85149',
            background:   'transparent',
            border:       `1px solid ${disconnecting ? '#30363d' : 'rgba(248,81,73,0.3)'}`,
            borderRadius: 6,
            padding:      '5px 12px',
            cursor:       disconnecting ? 'not-allowed' : 'pointer',
            flexShrink:   0,
            transition:   'background 0.15s',
          }}
          onMouseEnter={e => {
            if (!disconnecting) e.currentTarget.style.background = 'rgba(248,81,73,0.08)';
          }}
          onMouseLeave={e => {
            if (!disconnecting) e.currentTarget.style.background = 'transparent';
          }}
        >
          {disconnecting ? 'Disconnecting...' : 'Disconnect'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Repositories() {
  const [repos,      setRepos]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showModal,  setShowModal]  = useState(false);

  // Load connected repos on mount
  useEffect(() => {
    loadRepos();
  }, []);

  async function loadRepos() {
    try {
      setLoading(true);
      const data = await fetchConnectedRepos();
      setRepos(data ?? []);
    } catch (err) {
      setError('Failed to load repositories.');
    } finally {
      setLoading(false);
    }
  }

  // Called when modal connects a new repo
  function handleRepoConnected(newRepo) {
    loadRepos(); // refresh list
  }

  // Called when a repo card disconnects
  function handleRepoDisconnected(repoId) {
    setRepos(prev => prev.filter(r => r._id !== repoId));
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   32,
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: 0 }}>
              Repositories
            </h1>
            <p style={{ fontSize: 13, color: '#8b949e', margin: '6px 0 0' }}>
              Manage connected repos — PRs will be reviewed automatically.
            </p>
          </div>

          {/* Add Repo button */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          7,
              fontSize:     13,
              fontWeight:   600,
              color:        '#fff',
              background:   '#7c3aed',
              border:       '1px solid #7c3aed',
              borderRadius: 8,
              padding:      '9px 16px',
              cursor:       'pointer',
              transition:   'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
          >
            <IconPlus />
            Add Repository
          </button>
        </div>

        {/* States */}
        {loading && (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: 60, fontSize: 14 }}>
            Loading repositories...
          </div>
        )}

        {error && (
          <div style={{
            background:   'rgba(248,81,73,0.08)',
            border:       '1px solid rgba(248,81,73,0.3)',
            borderRadius: 10,
            padding:      '16px 20px',
            color:        '#f85149',
            fontSize:     14,
          }}>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && repos.length === 0 && (
          <div style={{
            textAlign:    'center',
            padding:      '80px 24px',
            border:       '1px dashed #30363d',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔗</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
              No repositories connected
            </h3>
            <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 24 }}>
              Connect a GitHub repo to start getting automatic AI reviews on every PR.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          7,
                fontSize:     13,
                fontWeight:   600,
                color:        '#fff',
                background:   '#7c3aed',
                border:       'none',
                borderRadius: 8,
                padding:      '10px 20px',
                cursor:       'pointer',
              }}
            >
              <IconPlus />
              Add Your First Repository
            </button>
          </div>
        )}

        {/* Repo grid */}
        {!loading && repos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {repos.map(repo => (
              <RepoCard
                key={repo._id}
                repo={repo}
                onDisconnect={handleRepoDisconnected}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddRepoModal
          onClose={() => setShowModal(false)}
          onRepoConnected={(repo) => {
            handleRepoConnected(repo);
            setShowModal(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}