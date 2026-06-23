// client/src/api/repos.js
import axios from 'axios';

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

const API_BASE = '/api';

export async function fetchConnectedRepos() {
  const res = await api.get(`${API_BASE}/repos`);
  return res.data.data;
}

export async function fetchGitHubRepos() {
  const res = await api.get(`${API_BASE}/repos/github`);
  return res.data.data;
}
export async function connectRepo(githubRepoId, repoName) {
  const res = await api.post(`${API_BASE}/repos/connect`, {
    githubRepoId,
    repoName,
  });
  return res.data.data;
}

export async function disconnectRepo(repoId) {
  const res = await api.post(`${API_BASE}/repos/disconnect`, { repoId });
  return res.data;
}