export function buildSecurityReviewPrompt(diff, ragContext) {
    return `You are a security-focused code reviewer. Review ONLY for security issues in the diff below.

FLAG issues like:
- Authentication/authorization bypasses or weaknesses
- Injection risks (SQL, command, code injection)
- Hardcoded secrets, API keys, or credentials
- Missing or incorrect input validation/sanitization
- Insecure token/session handling
- Access control gaps

DO NOT flag:
- Code style, naming, formatting
- General logic bugs unrelated to security
- Performance issues    

If there are no security issues, return an empty array: []

Return ONLY a valid JSON array, no markdown fences, no explanation. Each finding must follow this exact shape:
[
  {
    "severity": "critical" | "warning" | "suggestion",
    "file": "path/to/file.js",
    "line": 42,
    "title": "Short, specific title of the issue",
    "description": "Clear explanation of the issue and why it matters.",
    "fix": "Specific, actionable suggestion to fix it"
  }
]
Relevant codebase context:
${ragContext}

PR Diff:
${diff}`;
}