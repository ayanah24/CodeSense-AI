import { fetchRepoFileTree, fetchFileContent } from "./githubRepoService.js";
import { chunkCode } from "./codeChunker.js";
import { upsertChunks, deleteRepoVectors } from "./pineconeService.js"
import User from "../models/User.js";

//indexes a repo's entire codebase into pinecone ..,fetches all code files from main branch, chunks them, embeds and stores
export async function indexRepo(repoId, repoFullName, userId) {
    console.log(`\nStarting indexing fpr repo:${repoFullName}`);

    // step 1 get user's encrypted github token
    const user = await User.findById(userId).select('+githubAccessToken');
    if (!user || !user.githubAccessToken) {
        throw new Error('user not found or github token missing')
    }
    // step 2 — delete old vectors for this repo
    console.log('Clearing old vectors from pinecone...');
    try {
        await deleteRepoVectors(repoId.toString());
    } catch (err) {
        console.log('No existing vectors to clear — fresh index');
    }

    // step 3 — fetch all code file paths from main branch
    console.log('Fetching file tree from GitHub...');
    const files = await fetchRepoFileTree(user.githubAccessToken, repoFullName);

    if (!files || files.length === 0) {
        console.log('No code files found in repo');
        return { filesProcessed: 0, chunksIndexed: 0 };
    }

    //fetch content
    console.log(`processing ${files.length} files..`);

    let allChunks = [];

    for (const file of files) {
        const content = await fetchFileContent(user.githubAccessToken, repoFullName, file.path);

        if (!content) {
            console.log(`skipping ${file.path}`);
            continue;
        }

        const fileChunks = chunkCode(content, file.path);
        allChunks = [...allChunks, ...fileChunks];

        console.log(`--> ${file.path} --> ${fileChunks.length} chunks`);

        //rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Total chunks to index: ${allChunks.length}`);

    //step5 upsert all chunks to pinecone
    const totalIndexed = await upsertChunks(repoId.toString(), allChunks);
    console.log(`\nIndexing complete for ${repoFullName}`);
    console.log(`Files processed: ${files.length}`);
    console.log(`Chunks indexed: ${totalIndexed}`);

    return {
        filesProcessed: files.length,
        chunksIndexed: totalIndexed,
    };
}

