// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase, User, MAX_WAIT_TIME } from '../lib/util';

// POST: Add a new user to the waitlist
export async function POST(request: Request) {
  await connectToDatabase(); // Ensure MongoDB is connected

  try {
    const { name, status = 'waiting', activities = [], urgency = false, timestamp = Date.now() } = await request.json();

    if (!name || activities.length === 0) {
      return NextResponse.json({ message: 'Name and activities are required' }, { status: 400 });
    }

    const newUser = new User({ name, status, activities, urgency, timestamp });
    await newUser.save(); // Save the user to the database
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding user', error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a user by ID
export async function DELETE(request: Request) {
  await connectToDatabase(); // Ensure MongoDB is connected

  try {
    const { id } = await request.json();  // Extract ID from request body

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findByIdAndDelete(id); // Find and delete the user by _id
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting user', error: error.message }, { status: 500 });
  }
}

// PUT: Update a user by ID (to mark as "using")
export async function PUT(request: Request) {
  await connectToDatabase(); // Ensure MongoDB is connected

  try {
    const { id, status } = await request.json();  // Extract id and status from request body

    if (!id || !status) {
      return NextResponse.json({ message: 'User ID and status are required' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }); // Update status
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'User status updated', user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating user', error: error.message }, { status: 500 });
  }
}

// GET: Fetch users and clean up expired users
export async function GET() {
  await connectToDatabase(); // Ensure MongoDB is connected

  try {
    const currentTime = Date.now();

    // Remove users who have exceeded the max wait time
    await User.deleteMany({
      timestamp: { $lt: currentTime - MAX_WAIT_TIME }
    });

    // Fetch the remaining users
    const users = await User.find();

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching users', error: error.message }, { status: 500 });
  }
}
