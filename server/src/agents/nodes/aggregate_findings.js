const SEVERITY_ORDER = ["critical", "warning", "suggestion"];

const SOURCE_PRIORITY = {
    security_review: 3,
    logic_review: 2,
    style_review: 1,
};

const LINE_PROXIMITY_THRESHOLD = 2;

function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
}

function titleSimilarity(titleA, titleB) {
    const wordsA = new Set(normalizeTitle(titleA));
    const wordsB = new Set(normalizeTitle(titleB));
    const intersection = [...wordsA].filter((w) => wordsB.has(w));
    const union = new Set([...wordsA, ...wordsB]);
    return union.size === 0 ? 0 : intersection.length / union.size;
}

const TITLE_SIMILARITY_THRESHOLD = 0.3;

function isDuplicate(a, b) {
    if (a.file !== b.file) return false;
    if (a.line == null || b.line == null) return false;
    if (Math.abs(a.line - b.line) > LINE_PROXIMITY_THRESHOLD) return false;
    return titleSimilarity(a.title, b.title) >= TITLE_SIMILARITY_THRESHOLD;
}


function dedupeFindings(findings) {
    const kept = [];

    for (const finding of findings) {
        const existingIndex = kept.findIndex((k) => isDuplicate(k, finding));

        if (existingIndex === -1) {
            kept.push(finding);
            continue;
        }

        const existing = kept[existingIndex];
        const existingPriority = SOURCE_PRIORITY[existing.source] ?? 0;
        const newPriority = SOURCE_PRIORITY[finding.source] ?? 0;

        if (newPriority > existingPriority) {
            kept[existingIndex] = finding;
        }
    }

    return kept;
}

function computeScore(findings) {
    const scores = { overall: 100, security: 100, performance: 100, quality: 100, tests: 100 };
    const deduction = { critical: 15, warning: 7, suggestion: 2 };

    for (const finding of findings) {
        const points = deduction[finding.severity] ?? deduction.suggestion;
        scores.overall = Math.max(0, scores.overall - points);

        if (finding.type === "security") {
            scores.security = Math.max(0, scores.security - points);
        } else if (finding.type === "quality") {
            scores.quality = Math.max(0, scores.quality - points);
        } else if (finding.type === "bug" || finding.type === "performance") {
            scores.performance = Math.max(0, scores.performance - points);
        }
    }

    return scores;
}

function sortBySeverity(findings) {
    return [...findings].sort(
        (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    );
}

function buildSummary(findings, diffType) {
    if (diffType === "trivial") {
        return "This is a trivial change (docs/config) — no automated review was performed.";
    }
    if (findings.length === 0) {
        return "No issues found. The change looks good.";
    }
    const criticalCount = findings.filter((f) => f.severity === "critical").length;
    const warningCount = findings.filter((f) => f.severity === "warning").length;
    const suggestionCount = findings.filter((f) => f.severity === "suggestion").length;

    return `Found ${findings.length} issue(s): ${criticalCount} critical, ${warningCount} warning, ${suggestionCount} suggestion.`;
}

export async function aggregateFindings(state) {
    const rawFindings = state.findings ?? [];
    const findings = dedupeFindings(rawFindings);
    const sortedFindings = sortBySeverity(findings);

    const finalReview = {
        summary: buildSummary(findings, state.diffType),
        score: computeScore(findings),
        issues: sortedFindings.map(({ source, ...rest }) => rest),
        positives: [],
    };

    return { finalReview };
}