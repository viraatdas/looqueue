// app/api/users/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
if (!mongoose.connections[0].readyState) {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  status: String,
  activities: [String],
  urgency: Boolean,
  timestamp: Number,
});

// Create User model if it doesn't already exist
const User = mongoose.models.User || mongoose.model('User', userSchema);

// GET: Fetch all users from the waitlist
export async function GET() {
  try {
    const users = await User.find();  // Fetch all users
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}
