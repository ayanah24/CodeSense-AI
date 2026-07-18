import { callLLMJson } from "../../services/llmService.js";
import { buildStyleReviewPrompt } from "../../prompt/styleReviewPrompt.js";

export async function styleReview(state) {
    const prompt = buildStyleReviewPrompt(state.diff, state.ragContext);
    let rawFindings;
    try {
        rawFindings = await callLLMJson(prompt);
    } catch (error) {
        console.error("style_review failed,skipping:", error.message);
        return { findings: [] }
    }

    if (!Array.isArray(rawFindings)) {
        console.error("style_review: expected array,got:", typeof rawFindings)
        return { findings: [] }
    }

    const findings = rawFindings.map((f) => ({
        source: "style_review",
        type: "quality",
        severity: f.severity ?? "suggestion",
        file: f.file ?? "unknown",
        line: f.line ?? null,
        title: f.title ?? "Untitled issue",
        description: f.description ?? "No description provided",
        fix: f.fix ?? "No fix suggested",
    }));

    return { findings }
}