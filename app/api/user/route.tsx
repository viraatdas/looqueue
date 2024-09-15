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

// DELETE: Remove a user by ID
export async function DELETE(request: Request) {
  const { id } = await request.json();  // Extract ID from request body

  if (!id) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }

  try {
    const user = await User.findByIdAndDelete(id); // Find and delete the user by _id
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}

// PUT: Update a user by ID (to mark as "using")
export async function PUT(request: Request) {
  const { id, status } = await request.json();  // Extract id and status from request body

  if (!id || !status) {
    return NextResponse.json({ message: 'User ID and status are required' }, { status: 400 });
  }

  try {
    const user = await User.findByIdAndUpdate(id, { status }, { new: true }); // Update status
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'User status updated', user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}