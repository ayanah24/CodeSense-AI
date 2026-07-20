import { useState } from 'react';
import { generateApiKey } from '../api/apiKeys.js';

// Icons
const IconX = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconKey = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
);

const IconCopy = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const IconAlert = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

// Main Component
export default function GenerateKeyModal({ onClose, onKeyGenerated }) {
    const [name, setName] = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [revealed, setRevealed] = useState(null); // { apiKey, keyPrefix, name } once generated
    const [copied, setCopied] = useState(false);

    const isLocked = revealed !== null; // once true, no X / backdrop close allowed

    async function handleGenerate(e) {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please give this key a name.');
            return;
        }
        setError(null);
        setGenerating(true);
        try {
            const data = await generateApiKey(name.trim());
            setRevealed(data); // { apiKey, keyPrefix, name }
            onKeyGenerated(); // let parent refetch the list now — id only exists after refetch
        } catch (err) {
            setError('Failed to generate key. Please try again.');
        } finally {
            setGenerating(false);
        }
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(revealed.apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            setError('Could not copy automatically — please select and copy manually.');
        }
    }

    function handleBackdropClick(e) {
        if (isLocked) return;
        if (e.target === e.currentTarget) onClose();
    }

    return (
        // Backdrop
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}
        >
            {/* Modal */}
            <div style={{
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: 14,
                width: '100%',
                maxWidth: 480,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid #30363d',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 28, height: 28,
                            background: 'rgba(124,58,237,0.12)',
                            borderRadius: 7,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#7c3aed',
                        }}>
                            <IconKey />
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>
                            {isLocked ? 'Your new API key' : 'Generate API Key'}
                        </h2>
                    </div>

                    {!isLocked && (
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: '1px solid #30363d',
                                borderRadius: 6,
                                color: '#8b949e',
                                cursor: 'pointer',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.15s, border-color 0.15s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = '#fff';
                                e.currentTarget.style.borderColor = '#8b949e';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = '#8b949e';
                                e.currentTarget.style.borderColor = '#30363d';
                            }}
                        >
                            <IconX />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px' }}>

                    {!isLocked ? (
                        //  Form state
                        <form onSubmit={handleGenerate}>
                            <label style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#8b949e',
                                marginBottom: 8,
                            }}>
                                Key name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. CI pipeline — user-management-app"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoFocus
                                disabled={generating}
                                style={{
                                    width: '100%',
                                    background: '#161b22',
                                    border: '1px solid #30363d',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    fontSize: 13,
                                    color: '#fff',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                            <p style={{ fontSize: 11, color: '#8b949e', margin: '8px 0 0' }}>
                                Use a name that helps you remember where this key is used.
                            </p>

                            {error && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginTop: 14,
                                    background: 'rgba(248,81,73,0.08)',
                                    border: '1px solid rgba(248,81,73,0.3)',
                                    borderRadius: 8,
                                    padding: '10px 14px',
                                    color: '#f85149',
                                    fontSize: 12,
                                }}>
                                    <IconAlert />
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={generating}
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#8b949e',
                                        background: 'transparent',
                                        border: '1px solid #30363d',
                                        borderRadius: 8,
                                        padding: '9px 16px',
                                        cursor: generating ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={generating}
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#fff',
                                        background: generating ? '#5b21b6' : '#7c3aed',
                                        border: '1px solid #7c3aed',
                                        borderRadius: 8,
                                        padding: '9px 16px',
                                        cursor: generating ? 'not-allowed' : 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    {generating ? 'Generating...' : 'Generate Key'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        // ── Locked reveal state ────────────────────────────────────────
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                background: 'rgba(240,136,62,0.07)',
                                border: '1px solid rgba(240,136,62,0.3)',
                                borderRadius: 8,
                                padding: '10px 14px',
                                marginBottom: 16,
                            }}>
                                <span style={{ color: '#f0883e', marginTop: 1 }}><IconAlert /></span>
                                <span style={{ fontSize: 12, color: '#f0883e' }}>
                                    Copy this key now — for security, it will never be shown again. If you lose it, you'll need to generate a new one.
                                </span>
                            </div>

                            <label style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#8b949e',
                                marginBottom: 8,
                            }}>
                                {revealed.name}
                            </label>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: '#161b22',
                                border: '1px solid #30363d',
                                borderRadius: 8,
                                padding: '10px 12px',
                            }}>
                                <code style={{
                                    flex: 1,
                                    fontSize: 12,
                                    color: '#3fb950',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                    overflowX: 'auto',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {revealed.apiKey}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        flexShrink: 0,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: copied ? '#3fb950' : '#fff',
                                        background: copied ? 'rgba(63,185,80,0.1)' : '#21262d',
                                        border: `1px solid ${copied ? 'rgba(63,185,80,0.3)' : '#30363d'}`,
                                        borderRadius: 6,
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {copied ? <IconCheck /> : <IconCopy />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>

                            {error && (
                                <div style={{ fontSize: 11, color: '#f85149', marginTop: 8 }}>
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                style={{
                                    width: '100%',
                                    marginTop: 20,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#fff',
                                    background: '#7c3aed',
                                    border: '1px solid #7c3aed',
                                    borderRadius: 8,
                                    padding: '10px 16px',
                                    cursor: 'pointer',
                                }}
                            >
                                I've copied it, close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}