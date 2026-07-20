import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    withCredentials: true,
});

const API_BASE = '/api';

export async function fetchApiKeys() {
    const res = await api.get(`${API_BASE}/keys`);
    return res.data.keys;
}

export async function generateApiKey(name) {
    const res = await api.post(`${API_BASE}/keys`, { name });
    return res.data; // { apiKey, keyPrefix, name }
}

export async function revokeApiKey(keyId) {
    const res = await api.delete(`${API_BASE}/keys/${keyId}`);
    return res.data; // { message: "Key revoked" }
}