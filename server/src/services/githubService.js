import axios from 'axios';
import 'dotenv/config';

// Fetch the diff of a pull request from GitHub
async function fetchPRDiff(diffUrl) {
    try {
        const response = await axios.get(diffUrl, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3.diff',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching diff:', error.message);
        throw new Error(`Failed to fetch PR diff :${error.message}`);
    }
}

//format review as markdown comment
function formatReviewComment(review) {
    const severityEmoji = {
        critical: '🔴',
        warning: '🟡',
        suggestion: '💡',
    };
    //overall score indicator
    const scoreEmoji = review.score.overall >= 70 ? '✅' : '❌';

    //issue section
    const issueSection =
        review.issues.length === 0
            ? '**No issues found! Great work.** 🎉'
            : review.issues
                .map(
                    (issue) => `
        ${severityEmoji[issue.severity]} **${issue.severity.toUpperCase()}** — ${issue.title}
- **File:** \`${issue.file}\` : Line ${issue.line}
- **Problem:** ${issue.description}
- **Fix:** ${issue.fix}
        `
                ).join(`\n---\n`);

    //positives section
    const positivesSection =
        review.positives && review.positives.length > 0
            ? review.positives.map((p) => `- ✅ ${p}`).join('\n')
            : '- None noted';

    //full markdown comment
    return `## 🤖 CodeSense AI Review

${review.summary}

### Score ${scoreEmoji}

| Overall | Security | Performance | Quality | Tests |
|---------|----------|-------------|---------|-------|
| **${review.score.overall}/100** | ${review.score.security}/100 | ${review.score.performance}/100 | ${review.score.quality}/100 | ${review.score.tests}/100 |

---

### Issues Found (${review.issues.length})

${issueSection}

---
### What's Good

${positivesSection}

---
*Reviewed by CodeSense AI • Minimum passing score: 70/100*`;
}

//post comment on github pr
async function postPRComment(repoFullName, prNumber, review) {
    try {
        const comment = formatReviewComment(review);

        await axios.post(
            `https://api.github.com/repos/${repoFullName}/issues/${prNumber}/comments`,
            { body: comment },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );
        console.log(`Posted review comment on PR #${prNumber} in ${repoFullName}`);
    } catch (error) {
        console.error('Error posting review comment:', error.response?.data || error.meassage);
        throw new Error(`Failed to post comment: ${error.message}`);
    }
}

//set github status check(Merge gate)
async function setStatusCheck(repoFullName, commitSha, score, minScore = 70) {
    try {
        const passed = score >= minScore;
        await axios.post(
            `https://api.github.com/repos/${repoFullName}/statuses/${commitSha}`,
            {
                state: passed ? 'success' : 'failure',
                description: passed
                    ? `Score ${score}/100 >= ${minScore} (Passed)`
                    : `Score ${score}/100 < ${minScore} (Failed)`,

                context: 'CodeSense AI',
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );
        console.log(
            `✅ Status check set — ${passed ? 'SUCCESS ✅' : 'FAILURE ❌'} (${score}/100)`
        )
    } catch (error) {
        console.error('Error setting status check:', error.response?.data || error.message);
        throw new Error(`Failed to set status check: ${error.message}`);
    }
}

export { fetchPRDiff, postPRComment, setStatusCheck }; 