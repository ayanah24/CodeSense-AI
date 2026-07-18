import { Annotation } from '@langchain/langgraph';

const ReviewState = Annotation.Root({
    diff: Annotation(),

    ragContext: Annotation(),

    diffType: Annotation(),

    findings: Annotation({
        reducer: (existing, update) => existing.concat(update),
        default: () => [],
    }),

    finalReview: Annotation(),
});

export { ReviewState };