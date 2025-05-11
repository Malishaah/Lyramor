// src/index.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { app } = require('./app');
const { UserModel } = require('./models/user-model');

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 5005;
const dbUrl = process.env.DATABASE_URL || '';

async function main() {
  try {
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables.');
    }

    await mongoose.connect(dbUrl);
    // Ensure the unique index on "username" is created
    await UserModel.syncIndexes();
    console.log('Connected to the database.');

    app.listen(port, () => {
      console.log(`Server is running: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
}

main();
