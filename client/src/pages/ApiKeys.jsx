import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import GenerateKeyModal from '../components/GenerateKeyModal.jsx';
import { fetchApiKeys, revokeApiKey } from '../api/apiKeys.js';

//Icons
const IconPlus = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const IconKey = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
);

//Key Card    
function KeyCard({ apiKey, onRevoke }) {
    const [revoking, setRevoking] = useState(false);

    async function handleRevoke() {
        if (!window.confirm(`Revoke "${apiKey.name}"? Anything using this key will stop working immediately.`)) return;

        setRevoking(true);
        try {
            await revokeApiKey(apiKey._id);
            onRevoke(apiKey._id);
        } catch (err) {
            alert('Failed to revoke key. Please try again.');
        } finally {
            setRevoking(false);
        }
    }

    const isRevoked = apiKey.revoked;

    return (
        <div style={{
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: 12,
            padding: '20px 24px',
            opacity: isRevoked ? 0.6 : 1,
            transition: 'border-color 0.15s',
        }}
            onMouseEnter={e => { if (!isRevoked) e.currentTarget.style.borderColor = '#7c3aed'; }}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

                {/* Key info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 300px' }}>
                    <div style={{
                        width: 36, height: 36,
                        background: 'rgba(124,58,237,0.12)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#7c3aed',
                        flexShrink: 0,
                    }}>
                        <IconKey />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#fff',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {apiKey.name}
                            </span>
                            {isRevoked && (
                                <span style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: '#f85149',
                                    background: 'rgba(248,81,73,0.1)',
                                    border: '1px solid rgba(248,81,73,0.25)',
                                    borderRadius: 4,
                                    padding: '2px 7px',
                                }}>
                                    Revoked
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 12px', marginTop: 4 }}>
                            <code style={{
                                fontSize: 11,
                                color: '#8b949e',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            }}>
                                {apiKey.keyPrefix}••••••••
                            </code>
                            <span style={{ fontSize: 11, color: '#8b949e' }}>
                                · Created {new Date(apiKey.createdAt).toLocaleDateString()}
                            </span>
                            <span style={{ fontSize: 11, color: '#8b949e' }}>
                                · {apiKey.lastUsedAt ? `Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Revoke button */}
                {!isRevoked && (
                    <button
                        onClick={handleRevoke}
                        disabled={revoking}
                        style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: revoking ? '#8b949e' : '#f85149',
                            background: 'transparent',
                            border: `1px solid ${revoking ? '#30363d' : 'rgba(248,81,73,0.3)'}`,
                            borderRadius: 6,
                            padding: '5px 12px',
                            cursor: revoking ? 'not-allowed' : 'pointer',
                            flexShrink: 0,
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => {
                            if (!revoking) e.currentTarget.style.background = 'rgba(248,81,73,0.08)';
                        }}
                        onMouseLeave={e => {
                            if (!revoking) e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {revoking ? 'Revoking...' : 'Revoke'}
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ApiKeys() {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadKeys();
    }, []);

    async function loadKeys() {
        try {
            setLoading(true);
            const data = await fetchApiKeys();
            setKeys(data ?? []);
        } catch (err) {
            setError('Failed to load API keys.');
        } finally {
            setLoading(false);
        }
    }

    // Called right after a key is generated inside the modal —
    // POST /api/keys doesn't return an _id, so we refetch to get one
    function handleKeyGenerated() {
        loadKeys();
    }

    function handleRevoked(keyId) {
        setKeys(prev => prev.map(k => k._id === keyId ? { ...k, revoked: true } : k));
    }

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16,
                    marginBottom: 32,
                }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: 0 }}>
                            API Keys
                        </h1>
                        <p style={{ fontSize: 13, color: '#8b949e', margin: '6px 0 0' }}>
                            Use API keys to trigger CodeSense reviews from any CI pipeline.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#fff',
                            background: '#7c3aed',
                            border: '1px solid #7c3aed',
                            borderRadius: 8,
                            padding: '9px 16px',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                        onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
                    >
                        <IconPlus />
                        Generate New Key
                    </button>
                </div>

                {/* States */}
                {loading && (
                    <div style={{ textAlign: 'center', color: '#8b949e', padding: 60, fontSize: 14 }}>
                        Loading API keys...
                    </div>
                )}

                {error && (
                    <div style={{
                        background: 'rgba(248,81,73,0.08)',
                        border: '1px solid rgba(248,81,73,0.3)',
                        borderRadius: 10,
                        padding: '16px 20px',
                        color: '#f85149',
                        fontSize: 14,
                    }}>
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && keys.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 24px',
                        border: '1px dashed #30363d',
                        borderRadius: 12,
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 16 }}>🔑</div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                            No API keys yet
                        </h3>
                        <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 24 }}>
                            Generate a key to trigger CodeSense reviews from GitHub Actions or any other CI pipeline.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#fff',
                                background: '#7c3aed',
                                border: 'none',
                                borderRadius: 8,
                                padding: '10px 20px',
                                cursor: 'pointer',
                            }}
                        >
                            <IconPlus />
                            Generate Your First Key
                        </button>
                    </div>
                )}

                {/* Key list */}
                {!loading && keys.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {keys.map(k => (
                            <KeyCard
                                key={k._id}
                                apiKey={k}
                                onRevoke={handleRevoked}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <GenerateKeyModal
                    onClose={() => setShowModal(false)}
                    onKeyGenerated={handleKeyGenerated}
                />
            )}
        </DashboardLayout>
    );
}