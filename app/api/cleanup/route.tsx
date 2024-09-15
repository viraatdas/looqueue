import { NextResponse } from 'next/server';
import { connectToDatabase, User, MAX_WAIT_TIME } from '../lib/util'; // Ensure the correct path for util

// Function to clean up users who exceed the max wait time
export async function GET() {
  await connectToDatabase(); // Ensure MongoDB is connected

  try {
    const currentTime = Date.now();

    // Find all users who have exceeded the wait time
    const expiredUsers = await User.find({
      timestamp: { $lt: currentTime - MAX_WAIT_TIME },
    });

    if (expiredUsers.length > 0) {
      // Remove expired users
      await User.deleteMany({
        timestamp: { $lt: currentTime - MAX_WAIT_TIME },
      });

      return NextResponse.json({
        message: `${expiredUsers.length} users removed from the waitlist.`,
      });
    } else {
      return NextResponse.json({ message: 'No users to remove.' });
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Error cleaning up users', error: error.message },
      { status: 500 }
    );
  }
}
