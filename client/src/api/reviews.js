import axios from 'axios';

//base url
const API_BASE='/api';

//fetch all reviews — used on Dashboard page
export async function fetchAllReviews() {
    const res = await axios.get(`${API_BASE}/reviews`);
    return res.data.data;
}

//fetch single review by ID — used on Review Detail page
export async function fetchReviewById(id) {
    const res = await axios.get(`${API_BASE}/reviews/${id}`);
    return res.data.data;
}

//fetch stats — used on Dashboard for metric cards
export async function fetchStats() {
    const res=await axios.get(`${API_BASE}/reviews/stats`);
    return res.data.data;
}

//manual review
export async function manualReview(code, language) {
    const res = await axios.post(`${API_BASE}/review/manual`, {
        code,
        language,
    });
    return res.data.data;
}