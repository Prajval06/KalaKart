const mongoose = require('mongoose');
const config   = require('./config/config');
const app      = require('./app');

const start = async () => {
  try {
    await mongoose.connect(config.mongoUrl);
    console.log('✅ MongoDB connected');

    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server...');
  await mongoose.disconnect();
  process.exit(0);
});

start();