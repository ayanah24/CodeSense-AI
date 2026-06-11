import axios from 'axios';

function buildPrompt(prTitle, author, formattedDiff) {
  return `
You are an expert senior software engineer performing a code review.
Analyze the following Pull Request changes carefully.

PR Title: ${prTitle}
Author: ${author}

CODE CHANGES:
${formattedDiff}

Your task is to review this code for:
1. Bugs and logic errors
2. Security vulnerabilities (injection, exposed secrets, auth issues)
3. Performance problems (unnecessary loops, blocking calls, memory leaks)
4. Code quality (naming, duplication, complexity, readability)
5. Missing error handling
6. Missing or inadequate tests

CRITICAL INSTRUCTIONS:
- Respond ONLY with a valid JSON object
- No explanation text before or after
- No markdown formatting
- No backticks
- Just the raw JSON object

Return exactly this JSON structure:
{
  "summary": "2-3 sentence overall summary of the changes and main concerns",
  "score": {
    "overall": <number 0-100>,
    "security": <number 0-100>,
    "performance": <number 0-100>,
    "quality": <number 0-100>,
    "tests": <number 0-100>
  },
  "issues": [
    {
      "type": "<security|bug|performance|quality|suggestion>",
      "severity": "<critical|warning|suggestion>",
      "file": "<filename>",
      "line": <line number>,
      "title": "<short title>",
      "description": "<explain why this is a problem>",
      "fix": "<specific fix suggestion>"
    }
  ],
  "positives": ["<what was done well>"]
}

If there are no issues found, return an empty array for issues.
Score 0-100 where 100 is perfect code.
Be specific — always mention exact file and line number.
  `.trim();
}

export default {buildPrompt};