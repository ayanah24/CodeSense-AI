# Security Policy

## Data Codesense AI  Access
- **GitHub OAuth Token** — stored AES-256-CBC encrypted in MongoDB
- **Scope requested** — `repo` (required for webhook registration)
- **What Codesense AI do with it** — only used to register/delete webhooks on repos you explicitly connect

## What Codesense AI  Never Do
- Never read your code directly
- Never store your code
- Never access repos you haven't connected
- Never share your token with third parties

## Token Storage
- Encrypted at rest using AES-256-CBC
- Never returned in any API response
- Deleted when you disconnect your account

## API Keys

API keys allow you to trigger code reviews programmatically from CI/CD pipelines (e.g., GitHub Actions, GitLab CI, Jenkins) without browser-based authentication.

### How Keys Are Secured
- **One-time reveal** — the raw key (`csk_live_...`) is shown exactly once at generation time; it is never stored or retrievable again
- **SHA-256 hashed at rest** — only the irreversible hash is persisted in MongoDB; a database breach does not expose usable keys
- **32 bytes of randomness** — each key contains 256 bits of cryptographically random entropy (`crypto.randomBytes(32)`)
- **Prefix for identification** — a non-secret prefix (`csk_live_••••`) is stored so you can identify keys in the dashboard without exposing the full secret

### Key Lifecycle
- **Generation** — authenticated users create keys from the dashboard; the raw key is returned once in the HTTP response
- **Authentication** — incoming API requests include the key via `Authorization: Bearer csk_live_...`; the server hashes it and looks up the matching record
- **Revocation** — keys can be instantly revoked from the dashboard; revoked keys are rejected on all subsequent requests
- **Scope** — API keys can only submit code diffs for review and poll for results; they cannot access OAuth tokens, modify repos, or manage your account

### Best Practices
- Store your API key in your CI provider's **encrypted secrets** (e.g., GitHub Secrets, GitLab CI Variables)
- **Never** commit an API key to source control
- Rotate keys periodically and revoke any key you suspect has been compromised
- Use descriptive key names (e.g., `github-actions-prod`) so you can audit usage from the dashboard
