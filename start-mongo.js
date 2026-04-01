const { MongoMemoryServer } = require('mongodb-memory-server');

async function startMongo() {
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
      }
    });

    const uri = mongod.getUri();
    console.log(`✅ MongoDB Memory Server started successfully at: ${uri}`);
    console.log(`You can now run 'npm run seed' and 'npm run dev'.`);
  } catch (error) {
    console.error('Failed to start MongoDB Memory Server:', error);
    process.exit(1);
  }
}

startMongo();
