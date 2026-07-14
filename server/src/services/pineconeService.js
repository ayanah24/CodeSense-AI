import { index } from '../config/pineconeClient.js';
import { generateEmbedding, generateEmbeddings } from './embeddingService.js';

// stores code chunks in pinecone under a repo's namespace
export async function upsertChunks(repoId, chunks) {
    if (!chunks || chunks.length === 0) {
        console.warn(`upsertChunks: no chunks to upsert for repo ${repoId} — skipping.`);
        return { total: 0 };
    }
    try {
        //convert all chunks to vectors
        const contents = chunks.map(chunk => chunk.content);
        const embeddings = await generateEmbeddings(contents);

        //map to pinecone upsert format
        const vectors = chunks.map((chunk, i) => ({
            id: chunk.id,
            values: embeddings[i],
            metadata: {
                filePath: chunk.filePath,
                startLine: chunk.startLine,
                endLine: chunk.endLine,
                language: chunk.language,
                content: chunk.content,
            }
        }));

        //upsert vectors in batches of 100
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            await index.namespace(repoId).upsert({ records: batch });
            console.log(`upsert batch ${Math.floor(i / batchSize) + 1} for repo ${repoId}`);
        }
        console.log(`Successfully upserted ${vectors.length} chunks for repo ${repoId}`);
        return { total: vectors.length };
    }
    catch (error) {
        console.error(`Error upserting vectors for repo ${repoId}:`, error.message);
        throw error;
    }
}

// searches pinecone for code chunks similar to the given text
export async function searchSimilarChunks(repoId, queryText, topK = 5) {
    try {
        const queryVector = await generateEmbedding(queryText);
        const results = await index.namespace(repoId).query({
            vector: queryVector,
            topK: topK,
            includeMetadata: true,

        });
        //extract & format the matches
        const matches = results.matches.map(match => ({
            score: match.score,
            filepath: match.metadata.filepath,
            startLine: match.metadata.startLine,
            endLine: match.metadata.endLine,
            content: match.metadata.content,
        }));

        console.log(`found ${matches.length} similar chunks for repo ${repoId}`);
        return matches;
    } catch (err) {
        console.error('pinecone search error:', err.message);
        throw err;
    }
}

//delete all vectors for a repo namespace(useful for reindexing)
export async function deleteRepoVectors(repoId) {
    try {
        await index.namespace(repoId).deleteAll();
        console.log(`Deleted all vectors for repo ${repoId}`);
    } catch (err) {
        console.error('Error deleting vectors for repo ${repoId}:', err.message);
        throw err;
    }
}
