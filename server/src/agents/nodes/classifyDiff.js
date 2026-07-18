import { callLLM } from "../../services/llmService.js";
import { buildClassifyPrompt } from "../../prompt/classifyPrompt.js";

const VALID_TYPES = ["trivial", "security-sensitive", "logic-heavy", "style-only"];

export async function classifyDiff(state) {
    const prompt = buildClassifyPrompt(state.diff, state.ragContext);

    const rawResponse = await callLLM(prompt);

    const cleaned = rawResponse.trim().toLowerCase();

    const diffType = VALID_TYPES.includes(cleaned) ? cleaned : "logic-heavy";

    return { diffType };
}