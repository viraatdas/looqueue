import mongoose from 'mongoose';

export const MAX_WAIT_TIME = 20 * 60 * 1000; // 20 minutes in milliseconds
const mongoUri = process.env.MONGO_URI;

// Connect to MongoDB
export const connectToDatabase = async () => {
  if (!mongoose.connections[0].readyState) {
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }
    await mongoose.connect(mongoUri);
  }
};

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  status: String,
  activities: [String],
  urgency: Boolean,
  timestamp: Number, // For tracking when the user was added
});

// Create and export User model
export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Function to remove users based on max wait time
export const removeExpiredUsers = async () => {
  const currentTime = Date.now();
  await User.deleteMany({ timestamp: { $lt: currentTime - MAX_WAIT_TIME } });
};
