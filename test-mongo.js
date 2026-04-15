const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const mongoLine = env.split('\n').find(line => line.startsWith('MONGODB_URI='));
process.env.MONGODB_URI = mongoLine.substring(mongoLine.indexOf('=') + 1).trim();
const mongoose = require('mongoose');

async function test() {
  console.log("Connecting to:", process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected successfully!");
    process.exit(0);
  } catch (err) {
    console.log("Connection failed:", err.message);
    process.exit(1);
  }
}
test();
