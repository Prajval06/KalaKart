const mongoose = require('mongoose');
const config   = require('./config/config');
const app      = require('./app');

const start = async () => {
  try {
    await mongoose.connect(config.mongoUrl);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed:', err.message);
    console.warn('⚠️  Server starting without database...');
  }

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server...');
  await mongoose.disconnect();
  process.exit(0);
});

start();