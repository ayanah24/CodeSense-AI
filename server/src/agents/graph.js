import { StateGraph, START, END } from "@langchain/langgraph";
import { ReviewState } from "./state.js";
import { classifyDiff } from "./nodes/classifyDiff.js";
import { securityReview } from "./nodes/securityReview.js";
import { logicReview } from "./nodes/logicReview.js";
import { styleReview } from "./nodes/styleReview.js";
import { aggregateFindings } from "./nodes/aggregate_findings.js";

function routeAfterClassify(state) {
    switch (state.diffType) {
        case "trivial":
            return ["aggregate_findings"];
        case "style-only":
            return ["style_review"];
        case "security-sensitive":
            return ["security_review", "logic_review"];
        case "logic-heavy":
        default:
            return ["logic_review", "style_review"];
    }
}

const workflow = new StateGraph(ReviewState)
    .addNode("classify_diff", classifyDiff)
    .addNode("security_review", securityReview)
    .addNode("logic_review", logicReview)
    .addNode("style_review", styleReview)
    .addNode("aggregate_findings", aggregateFindings)

    .addEdge(START, "classify_diff")
    .addConditionalEdges("classify_diff", routeAfterClassify, [
        "security_review",
        "logic_review",
        "style_review",
        "aggregate_findings",
    ])
    .addEdge("security_review", "aggregate_findings")
    .addEdge("logic_review", "aggregate_findings")
    .addEdge("style_review", "aggregate_findings")
    .addEdge("aggregate_findings", END);

export const reviewGraph = workflow.compile();
