import axios from 'axios';
import { decrypt } from '../utils/encryption.js';
import 'dotenv/config';

//Private Helpers

// Decrypt token 
function getGitHubHeaders(encryptedToken) {
  const token = decrypt(encryptedToken);
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  };
}

// GitHub error handler 
function handleGitHubError(error, context) {
  const status = error.response?.status;

  if (status === 401) throw new Error('GITHUB_TOKEN_INVALID');
  if (status === 403) throw new Error('GITHUB_TOKEN_INSUFFICIENT_SCOPE');
  if (status === 404) throw new Error(`GITHUB_NOT_FOUND: ${context}`);

  throw new Error(`GitHub API error in ${context}: ${error.message}`);
}

//Public Functions 
async function fetchUserRepos(encryptedToken) {
  try {
    const response = await axios.get(
      'https://api.github.com/user/repos',
      {
        headers: getGitHubHeaders(encryptedToken),
        params: {
          type: 'owner',
          sort: 'updated',
          per_page: 100,
        },
      }
    );

    return response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      description: repo.description,
      language: repo.language,
      updatedAt: repo.updated_at,
      stars: repo.stargazers_count,
    }));

  } catch (error) {
    handleGitHubError(error, 'fetchUserRepos');
  }
}

async function registerWebhook(encryptedToken, repoFullName) {
  try {
    const response = await axios.post(
      `https://api.github.com/repos/${repoFullName}/hooks`,
      {
        name: 'web',
        active: true,
        events: ['pull_request'],
        config: {
          url: process.env.WEBHOOK_URL,
          content_type: 'json',
          secret: process.env.GITHUB_WEBHOOK_SECRET,
          insecure_ssl: '1',
        },
      },
      { headers: getGitHubHeaders(encryptedToken) }
    );

    console.log(`Webhook registered on ${repoFullName} — hookId: ${response.data.id}`);
    return response.data.id;

  } catch (error) {
    //handle impodent
    if (error.response?.status === 422) {
      console.log(`Webhook already exists on ${repoFullName}`);
      const hooks = await axios.get(
        `https://api.github.com/repos/${repoFullName}/hooks`,
        { headers: getGitHubHeaders(encryptedToken) }
      );
      const existing = hooks.data.find(
        h => h.config.url === process.env.WEBHOOK_URL
      );
      return existing?.id ?? null;
    }
    handleGitHubError(error, 'registerWebhook');
  }
}

async function deleteWebhook(encryptedToken, repoFullName, hookId) {
  try {
    await axios.delete(
      `https://api.github.com/repos/${repoFullName}/hooks/${hookId}`,
      { headers: getGitHubHeaders(encryptedToken) }
    );
    console.log(`Webhook deleted from ${repoFullName} — hookId: ${hookId}`);

  } catch (error) {
    // 404 = already deleted — silently ignore
    if (error.response?.status === 404) {
      console.log(`Webhook already deleted from ${repoFullName}`);
      return;
    }
    handleGitHubError(error, 'deleteWebhook');
  }
}

//fetches all file paths in a repo from the main branch
async function fetchRepoFileTree(encryptedToken, repoFullName) {
  try {
    // recursive=1 means get ALL files in all subdirectories
    const response = await axios.get(
      `https://api.github.com/repos/${repoFullName}/git/trees/HEAD?recursive=1`,
      { headers: getGitHubHeaders(encryptedToken) }
    );

    // filter only files (not directories) and only code files
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs'];

    const codeFiles = response.data.tree.filter(item =>
      item.type === 'blob' && //blob = file , tree = directory
      codeExtensions.some(ext => item.path.endsWith(ext)) &&
      !item.path.includes('node_modules') &&
      !item.path.includes('.min.') &&
      !item.path.includes('dist/')
    );

    console.log(`Found ${codeFiles.length} code files in ${repoFullName}`);
    return codeFiles;

  } catch (error) {
    handleGitHubError(error, 'fetchRepoFileTree');
  }
}

// fetches the actual content of a single file
async function fetchFileContent(encryptedToken, repoFullName, filePath) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repoFullName}/contents/${filePath}`,
      { headers: getGitHubHeaders(encryptedToken) }
    );

    // github returns file content as base64
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    return content;

  } catch (error) {
    console.error(`Failed to fetch ${filePath}: ${error.message}`);
    return null;
  }
}

export { fetchUserRepos, registerWebhook, deleteWebhook, fetchRepoFileTree, fetchFileContent };