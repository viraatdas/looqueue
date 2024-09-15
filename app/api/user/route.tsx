// app/api/user/route.ts
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
  timestamp: Number,  // For tracking when user was added
});

// Create User model if it doesn't already exist
const User = mongoose.models.User || mongoose.model('User', userSchema);

// POST: Add a new user to the waitlist
export async function POST(request: Request) {
  const { name, status, activities, urgency, timestamp } = await request.json();

  try {
    const newUser = new User({ name, status, activities, urgency, timestamp });
    await newUser.save(); // Save the user to the database
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding user' }, { status: 500 });
  }
}
