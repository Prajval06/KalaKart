const axios = require('axios');

const ML_BASE = process.env.ML_SERVICE_URL || 'http://localhost:8001';

const mlClient = axios.create({
  baseURL: ML_BASE,
  timeout: 5000,   // 5 second timeout — ML service must not block Node.js
});

// Get product recommendations
const getRecommendations = async (productId, limit = 5) => {
  try {
    const res = await mlClient.get(`/recommend/${productId}?limit=${limit}`);
    return res.data.data.recommendations;
  } catch (err) {
    console.error('ML recommendations failed — using fallback:', err.message);
    return [];  // fallback — return empty, frontend shows nothing
  }
};

// Analyze review sentiment
const analyzeSentiment = async (text, reviewId = null) => {
  try {
    const res = await mlClient.post('/sentiment', { text, review_id: reviewId });
    return res.data;
  } catch (err) {
    console.error('ML sentiment failed — skipping:', err.message);
    return { label: 'neutral', confidence: 0 };  // fallback
  }
};

// Get inventory forecast for admin panel
const getInventoryForecast = async (productId, daysAhead = 7) => {
  try {
    const res = await mlClient.get(`/forecast/${productId}?days_ahead=${daysAhead}`);
    return res.data.data;
  } catch (err) {
    console.error('ML forecast failed:', err.message);
    return null;
  }
};

// Get all at-risk products for admin dashboard
const getAtRiskProducts = async (riskLevel = 'high') => {
  try {
    const res = await mlClient.get(`/forecast/all/at-risk?risk_level=${riskLevel}`);
    return res.data.data.at_risk_products;
  } catch (err) {
    console.error('ML at-risk fetch failed:', err.message);
    return [];
  }
};

module.exports = { getRecommendations, analyzeSentiment, getInventoryForecast, getAtRiskProducts };