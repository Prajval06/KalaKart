
const axios = require('axios');

const mlClient = axios.create({
  baseURL: process.env.ML_SERVICE_URL || 'http://localhost:8001',
  timeout: 5000,
});

const getRecommendations = async (productId, limit = 5) => {
  try {
    const res = await mlClient.get(`/recommend/${productId}?limit=${limit}`);
    return res.data.data.recommendations;
  } catch (err) {
    console.error('ML recommendations failed:', err.message);
    return [];
  }
};

const analyzeSentiment = async (text, reviewId = null) => {
  try {
    const res = await mlClient.post('/sentiment', { text, review_id: reviewId });
    return res.data;
  } catch (err) {
    console.error('ML sentiment failed:', err.message);
    return { label: 'neutral', confidence: 0 };
  }
};

const getInventoryForecast = async (productId, daysAhead = 7) => {
  try {
    const res = await mlClient.get(`/forecast/${productId}?days_ahead=${daysAhead}`);
    return res.data.data;
  } catch (err) {
    console.error('ML forecast failed:', err.message);
    return null;
  }
};

module.exports = { getRecommendations, analyzeSentiment, getInventoryForecast };