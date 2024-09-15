// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase, User, removeExpiredUsers } from '../lib/util'; // Import the database connection and User model



// GET: Fetch all users from the waitlist
export async function GET() {
  try {
    await connectToDatabase(); // Ensure database connection is established

    // Remove expired users based on wait time before fetching the remaining
    await removeExpiredUsers();


    const users = await User.find();  // Fetch all users
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}
