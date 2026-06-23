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

## Reporting Security Issues
Email: security@codesense.ai