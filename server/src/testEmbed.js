import { GoogleGenerativeAI } from '@google/generative-ai';
import { chunkCode } from './services/codeChunker.js';
import { upsertChunks, searchSimilarChunks } from './services/pineconeService.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'models/gemini-embedding-001' });

const result = await model.embedContent({
  content: { parts: [{ text: 'test code function' }], role: 'user' },
  outputDimensionality: 2048,
});

console.log('dimensions:', result.embedding.values.length);

const testCode = `
function authenticateUser(token) {
  if (!token) throw new Error('No token');
  return jwt.verify(token, process.env.JWT_SECRET);
}

async function createUser(userData) {
  const user = new User(userData);
  await user.save();
  return user;
}
`;

// chunk the code
const chunks = chunkCode(testCode, 'src/services/userService.js');
console.log('chunks created:', chunks.length);

// upsert to pinecone
await upsertChunks('test-repo-123', chunks);

// search
const results = await searchSimilarChunks('test-repo-123', 'verify jwt token authentication');
console.log('\nsearch results:');
results.forEach(r => {
  console.log(`score: ${r.score} | file: ${r.filePath}`);
  console.log('content preview:', r.content.slice(0, 80));
  console.log('---');
});