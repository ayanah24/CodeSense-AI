export function buildClassifyPrompt(diff, ragContext) {
    return `You are a triage classifier for a code review system. Classify the PR diff below into EXACTLY ONE category.

CATEGORIES AND SIGNALS TO LOOK FOR:

security-sensitive — choose this if ANY of these appear:
- File paths containing: auth, middleware, login, session, token, permission, payment, billing, encrypt, secret, credential
- Code involving: token validation, signature checks, password handling, access control, role checks, API key handling, input sanitization, SQL queries built from user input
- Any change to how a request is authenticated, authorized, or validated

logic-heavy — meaningful business logic, algorithms, calculations, or data transformation changes NOT covered by security-sensitive above

style-only — renames, code moved between files, formatting, comments added/removed, variable renames — behavior is unchanged

trivial — docs, README, config files (non-security config), whitespace-only changes

RULES:
- If a diff could match BOTH security-sensitive and logic-heavy, choose security-sensitive. It takes priority.
- Base your decision on the file path and code content shown, not just variable names in isolation.

EXAMPLES:

Diff: "middleware/authMiddleware.js: added isValidSignature(token) check before granting access"
Answer: security-sensitive

Diff: "utils/priceCalculator.js: changed discount calculation from flat rate to percentage-based"
Answer: logic-heavy

Diff: "components/Button.jsx: renamed handleClick to onButtonClick, no logic change"
Answer: style-only

Diff: "README.md: added setup instructions"
Answer: trivial

Now classify this diff. Respond with ONLY the category label, nothing else.

Relevant codebase context:
${ragContext}

PR Diff:
${diff}`;
}