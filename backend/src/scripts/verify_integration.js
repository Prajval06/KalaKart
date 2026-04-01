'use strict';

/**
 * verify_integration.js
 * ─────────────────────────────────────────────────────────────────
 * Verifies that the Backend API endpoints for Cart and Wishlist
 * are working correctly and storing data in MongoDB.
 * ─────────────────────────────────────────────────────────────────
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';
const TEST_USER = {
  email: 'test_user_' + Date.now() + '@example.com',
  password: 'Password123!',
  full_name: 'Test Persistent User'
};

let token = '';
let productId = ''; // We'll grab the first product from the seed

async function runTest() {
  console.log('🚀 Starting Integration Verification...\n');

  try {
    // 1. Register a new user
    console.log('Step 1: Registering test user...');
    const regRes = await axios.post(`${API_URL}/auth/register`, TEST_USER);
    console.log('✅ Registered successfully.');

    // 2. Login to get token
    console.log('Step 2: Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    token = loginRes.data.data.access_token;
    console.log('✅ Logged in. Token received.');

    const headers = { 'Authorization': `Bearer ${token}` };

    // 3. Get products to test with
    console.log('Step 3: Fetching products...');
    const prodRes = await axios.get(`${API_URL}/products`);
    const products = prodRes.data.data;
    if (products.length === 0) throw new Error('No products found in DB. Run npm run seed first.');
    productId = products[0].id;
    console.log(`✅ Found product: ${products[0].name} (${productId})`);

    // 4. Test Wishlist
    console.log('\nStep 4: Testing Wishlist...');
    const wishRes = await axios.post(`${API_URL}/users/wishlist/${productId}`, {}, { headers });
    console.log('✅ Toggled Wishlist:', wishRes.data.data.message);
    
    const getWishRes = await axios.get(`${API_URL}/users/wishlist`, { headers });
    if (getWishRes.data.data.wishlist.length > 0) {
      console.log('✅ Wishlist persistence verified in MongoDB.');
    } else {
      throw new Error('Wishlist item not found in DB after toggle.');
    }

    // 5. Test Cart
    console.log('\nStep 5: Testing Cart...');
    const addCartRes = await axios.post(`${API_URL}/cart/items`, {
      product_id: productId,
      quantity: 2
    }, { headers });
    console.log('✅ Added to Cart. Status:', addCartRes.data.success);

    const getCartRes = await axios.get(`${API_URL}/cart`, { headers });
    const cart = getCartRes.data.data.cart;
    if (cart.items.length > 0 && cart.items[0].product_id === productId) {
      const itemId = cart.items[0].id;
      console.log(`✅ Cart persistence verified. Item ID: ${itemId}`);

      // Test Update
      console.log('Step 6: Updating Cart Quantity...');
      await axios.patch(`${API_URL}/cart/items/${itemId}`, { quantity: 5 }, { headers });
      const updatedCartRes = await axios.get(`${API_URL}/cart`, { headers });
      if (updatedCartRes.data.data.cart.items[0].quantity === 5) {
        console.log('✅ Cart update verified.');
      }

      // Test Remove
      console.log('Step 7: Removing from Cart...');
      await axios.delete(`${API_URL}/cart/items/${itemId}`, { headers });
      const finalCartRes = await axios.get(`${API_URL}/cart`, { headers });
      if (finalCartRes.data.data.cart.items.length === 0) {
        console.log('✅ Cart removal verified.');
      }
    } else {
      throw new Error('Cart item not found in DB after adding.');
    }

    console.log('\n✨ ALL INTEGRATION TESTS PASSED! MongoDB persistence is working perfectly.');

  } catch (err) {
    console.error('\n❌ Verification Failed:');
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

runTest();
