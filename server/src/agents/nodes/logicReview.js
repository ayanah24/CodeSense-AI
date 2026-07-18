import { callLLMJson } from "../../services/llmService.js";
import { buildLogicReviewPrompt } from "../../prompt/logicReviewPrompt.js";

export async function logicReview(state) {
    const prompt = buildLogicReviewPrompt(state.diff, state.ragContext);

    let rawFindings;
    try {
        rawFindings = await callLLMJson(prompt);

    } catch (error) {
        console.error("logic_review failed, skipping:", error.message);
        return { findings: [] }
    }

    if (!Array.isArray(rawFindings)) {
        console.error("logic_review: expected array, got:", typeof rawFindings);
        return { findings: [] };
    }

    const findings = rawFindings.map((f) => ({
        source: "logic_review",
        type: "bug",
        severity: f.severity ?? "warning",
        file: f.file ?? "unknown",
        line: f.line ?? null,
        title: f.title ?? "Untitled issue",
        description: f.description ?? "No description provided",
        fix: f.fix ?? "No fix suggested",
    }));

    return { findings };
}