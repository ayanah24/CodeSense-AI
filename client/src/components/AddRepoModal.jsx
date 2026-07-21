import { useEffect, useState } from 'react';
import { fetchGitHubRepos, connectRepo } from '../api/repos.js';

//  Icons
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

//Main Component
export default function AddRepoModal({ onClose, onRepoConnected }) {
  const [repos,          setRepos]          = useState([]);
  const [filtered,       setFiltered]       = useState([]);
  const [search,         setSearch]         = useState('');
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [connecting,     setConnecting]     = useState(null);  // repoId being connected
  const [pendingConfirm, setPendingConfirm] = useState(null);  // repo waiting for confirmation

  // Fetch GitHub repos on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchGitHubRepos();
        setRepos(data);
        setFiltered(data);
      } catch (err) {
        setError('Failed to fetch repositories. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Search filter — client side, no API call
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(repos);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      repos.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      )
    );
  }, [search, repos]);

  // First click — show inline confirmation
  function handleConnectClick(repo) {
    if (repo.connected) return;
    setPendingConfirm(repo.id); // expand confirmation row
  }

  // Second click — actually connect
  async function handleConfirm(repo) {
    setPendingConfirm(null);
    setConnecting(repo.id);
    try {
      await connectRepo(repo.id, repo.fullName);

      setRepos(prev =>
        prev.map(r => r.id === repo.id ? { ...r, connected: true } : r)
      );
      onRepoConnected(repo);

    } catch (err) {
      setError(`Failed to connect ${repo.name}. Please try again.`);
    } finally {
      setConnecting(null);
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    // Backdrop
    <div
      onClick={handleBackdropClick}
      style={{
        position:        'fixed',
        inset:           0,
        background:      'rgba(0,0,0,0.6)',
        backdropFilter:  'blur(4px)',
        zIndex:          100,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         'clamp(8px, 3vw, 24px)',
      }}
    >
      {/* Modal */}
      <div style={{
        background:   '#0d1117',
        border:       '1px solid #30363d',
        borderRadius: 14,
        width:        '100%',
        maxWidth:     560,
        maxHeight:    '90vh',
        display:      'flex',
        flexDirection:'column',
        overflow:     'hidden',
      }}>

        {/* Header */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          padding:      '20px 24px',
          borderBottom: '1px solid #30363d',
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>
              Add Repository
            </h2>
            <p style={{ fontSize: 12, color: '#8b949e', margin: '4px 0 0' }}>
              Select a repo to connect — webhooks will be registered automatically
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background:   'transparent',
              border:       '1px solid #30363d',
              borderRadius: 6,
              color:        '#8b949e',
              cursor:       'pointer',
              padding:      '6px',
              display:      'flex',
              alignItems:   'center',
              transition:   'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color        = '#fff';
              e.currentTarget.style.borderColor  = '#8b949e';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color        = '#8b949e';
              e.currentTarget.style.borderColor  = '#30363d';
            }}
          >
            <IconX />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #30363d' }}>
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          8,
            background:   '#161b22',
            border:       '1px solid #30363d',
            borderRadius: 8,
            padding:      '8px 12px',
          }}>
            <span style={{ color: '#8b949e', display: 'flex' }}>
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{
                background:  'transparent',
                border:      'none',
                outline:     'none',
                color:       '#fff',
                fontSize:    13,
                width:       '100%',
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>

          {/* Loading */}
          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: '#8b949e', fontSize: 13 }}>
              Fetching your repositories...
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '16px 24px' }}>
              <div style={{
                background:   'rgba(248,81,73,0.08)',
                border:       '1px solid rgba(248,81,73,0.3)',
                borderRadius: 8,
                padding:      '12px 16px',
                color:        '#f85149',
                fontSize:     13,
              }}>
                {error}
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#8b949e', fontSize: 13 }}>
              {search ? `No repos matching "${search}"` : 'No repositories found'}
            </div>
          )}

          {/* Repo List */}
          {filtered.map(repo => {
            const isConnecting = connecting === repo.id;

            return (
              <div
                key={repo.id}
                style={{
                  borderBottom: '1px solid #21262d',
                  transition:   'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#161b22'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Main row */}
                <div style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  padding:        '12px 24px',
                }}>
                  {/* Repo Info */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: '#8b949e', display: 'flex' }}>
                        {repo.private ? <IconLock /> : <IconGlobe />}
                      </span>
                      <span style={{
                        fontSize:     13,
                        fontWeight:   600,
                        color:        '#fff',
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace:   'nowrap',
                      }}>
                        {repo.name}
                      </span>
                      {repo.language && (
                        <span style={{
                          fontSize:     10,
                          fontWeight:   500,
                          color:        '#8b949e',
                          background:   '#21262d',
                          border:       '1px solid #30363d',
                          borderRadius: 4,
                          padding:      '1px 6px',
                          flexShrink:   0,
                        }}>
                          {repo.language}
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p style={{
                        fontSize:     12,
                        color:        '#8b949e',
                        margin:       0,
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace:   'nowrap',
                      }}>
                        {repo.description}
                      </p>
                    )}
                  </div>

                  {/* Action button */}
                  <div style={{ marginLeft: 16, flexShrink: 0 }}>
                    {repo.connected ? (
                      <span style={{
                        fontSize:     11,
                        fontWeight:   600,
                        color:        '#3fb950',
                        background:   'rgba(63,185,80,0.1)',
                        border:       '1px solid rgba(63,185,80,0.3)',
                        borderRadius: 6,
                        padding:      '4px 10px',
                      }}>
                        Connected
                      </span>
                    ) : isConnecting ? (
                      <span style={{ fontSize: 12, color: '#8b949e' }}>Connecting...</span>
                    ) : (
                      <button
                        onClick={() => handleConnectClick(repo)}
                        style={{
                          fontSize:     12,
                          fontWeight:   600,
                          color:        pendingConfirm === repo.id ? '#f0883e' : '#fff',
                          background:   pendingConfirm === repo.id ? 'rgba(240,136,62,0.12)' : '#7c3aed',
                          border:       pendingConfirm === repo.id ? '1px solid rgba(240,136,62,0.4)' : '1px solid #7c3aed',
                          borderRadius: 6,
                          padding:      '4px 12px',
                          cursor:       'pointer',
                          transition:   'all 0.15s',
                        }}
                      >
                        {pendingConfirm === repo.id ? 'Are you sure?' : 'Connect'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline confirmation row — expands when pending */}
                {pendingConfirm === repo.id && (
                  <div style={{
                    margin:       '0 24px 12px',
                    padding:      '10px 14px',
                    background:   'rgba(240,136,62,0.07)',
                    border:       '1px solid rgba(240,136,62,0.3)',
                    borderRadius: 8,
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'space-between',
                    gap:          12,
                  }}>
                    <span style={{ fontSize: 12, color: '#f0883e' }}>
                      ⚠️ This will install a webhook on <strong>{repo.fullName}</strong>. CodeSense AI will review all future PRs automatically.
                    </span>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => setPendingConfirm(null)}
                        style={{
                          fontSize:     12,
                          fontWeight:   600,
                          color:        '#8b949e',
                          background:   'transparent',
                          border:       '1px solid #30363d',
                          borderRadius: 6,
                          padding:      '4px 10px',
                          cursor:       'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirm(repo)}
                        style={{
                          fontSize:     12,
                          fontWeight:   600,
                          color:        '#fff',
                          background:   '#f0883e',
                          border:       '1px solid #f0883e',
                          borderRadius: 6,
                          padding:      '4px 10px',
                          cursor:       'pointer',
                        }}
                      >
                        Yes, install webhook
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding:      '12px 24px',
          borderTop:    '1px solid #30363d',
          fontSize:     11,
          color:        '#8b949e',
          textAlign:    'center',
        }}>
          {repos.length > 0 && (
            `${repos.filter(r => r.connected).length} of ${repos.length} repos connected`
          )}
        </div>
      </div>
    </div>
  );
}