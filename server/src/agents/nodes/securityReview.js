import { callLLMJson } from "../../services/llmService.js";
import { buildSecurityReviewPrompt } from "../../prompt/securityReviewPrompt.js";

export async function securityReview(state) {
    const prompt = buildSecurityReviewPrompt(state.diff, state.ragContext);

    let rawFindings;
    try {
        rawFindings = await callLLMJson(prompt);

    } catch (error) {
        console.error("security_review failed,skipping:", error.message);
        return { findings: [] };
    }

    if (!Array.isArray(rawFindings)) {
        console.error("security_review: expected array, got:", typeof rawFindings);
        return { findings: [] };
    }

    const findings = rawFindings.map((f) => ({
        source: "security_review",
        type: "security",
        severity: f.severity ?? "warning",
        file: f.file ?? "unknown",
        line: f.line ?? null,
        title: f.title ?? "Untitled issue",
        description: f.description ?? "No description provided",
        fix: f.fix ?? "No fix suggested",
    }));

    return { findings };
}