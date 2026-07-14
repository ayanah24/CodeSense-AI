import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embeddingModel = genAI.getGenerativeModel({
    model: "models/gemini-embedding-001",
});

/**
 * converts a single text/code string into a vector (array of 768 numbers)
 * @param {string} text - code or text to embed
 * @returns {number[]} - array of 768 numbers
 */

export async function generateEmbedding(text) {
    if (!text || !text.trim()) {
        throw new Error('Cannot embed empty or whitespace-only text.');
    }
    try {
        const result = await embeddingModel.embedContent({
            content: {
                role: 'user',
                parts: [{ text: text.trim() }],
            },
            outputDimensionality: 2048,
        });

        const embedding = result.embedding.values;

        return embedding;
    } catch (err) {
        console.error('Embedding generation error:', err.message);
        throw err;
    }
}

/**
 * Generates embeddings for multiple text items in batch
 * @param{string[]} texts - Array of code/text strings
 * @returns{Promise<number[][]>} - 2D array of embeddings (one vector per text)
 */

export async function generateEmbeddings(texts) {
    try {
        const embeddings = await Promise.all(
            texts.map(text => generateEmbedding(text))
        );
        return embeddings;
    } catch (err) {
        console.error('Batch embedding error:', err.message);
        throw err;
    }
}