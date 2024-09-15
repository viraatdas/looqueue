"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Select,
  Checkbox,
  Button,
  useToast,
  CheckboxGroup,
  ChakraProvider,
} from '@chakra-ui/react';

type Activity = {
  id: string;
  label: string;
  duration: number; // Time in minutes for each activity
};

type User = {
  _id: string; // MongoDB ID to handle removal
  name: string;
  status: string;
  activities: string[];
  urgency: boolean;
  timestamp: number; // Timestamp of when user was added
};

const ACTIVITIES: Activity[] = [
  { id: 'number1', label: 'Number 1 (1 min)', duration: 1 },
  { id: 'number2', label: 'Number 2 (4 min)', duration: 4 },
  { id: 'shave', label: 'Shave (3 min)', duration: 3 },
  { id: 'shower', label: 'Shower (15 min)', duration: 15 },
  { id: 'misc', label: 'Miscellaneous (5 min)', duration: 5 },
];

export default function WaitlistForm() {
  const [name, setName] = useState<string>('');
  const [activities, setActivities] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users and handle dropping old users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data: User[] = await response.json();

      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Inside handleSubmit
    if (!name || activities.length === 0) {
      toast({
        title: 'Error',
        description: !name ? 'Name cannot be empty' : 'Please select at least one activity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (users.some(user => user.name === name)) {
      toast({
        title: 'Error',
        description: 'This person is already in the queue',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const timestamp = Date.now(); // Current timestamp for the user entry
      const status = "waiting";
      
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, activities, urgency, timestamp, status }), // Removed status
      });
      if (!response.ok) throw new Error('Failed to submit user data');
      toast({
        title: 'Success',
        description: 'Your information has been submitted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setName('');
      setActivities([]);
      setUrgency(false);
      fetchUsers();
    } catch (error) {
      console.error('Error submitting user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your information',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Remove a user from the queue
  const removeUser = async (id: string) => {
    try {
      console.log("removeUser is ", id);

      const response = await fetch('/api/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),  
      });

      if (!response.ok) throw new Error('Failed to remove user');

      toast({
        title: 'User Removed',
        description: 'The user has been removed from the queue.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers(); // Refresh the list after removal
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove the user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Mark user as "Using" and remove any previous user marked as "using"
  const markAsUsing = async (id: string) => {
    try {
      // Find the current user marked as "using"
      const currentUserUsing = users.find(user => user.status === 'using');

      // Remove the current user marked as "using"
      if (currentUserUsing) {
        await fetch(`/api/user`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentUserUsing._id }),  // Remove the current user
        });
      }

      // Mark the new user as "using"
      const response = await fetch(`/api/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'using' }),  
      });

      if (!response.ok) throw new Error('Failed to update user');
      toast({
        title: 'User Updated',
        description: 'The user is now using the bathroom.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };


  // Calculate the estimated wait time for each user
  const calculateWaitTime = (index: number) => {
    let waitTime = 0;
    for (let i = 0; i < index; i++) {
      const user = users[i];
      user.activities.forEach(activity => {
        const activityObj = ACTIVITIES.find(a => a.id === activity);
        if (activityObj) {
          waitTime += activityObj.duration;
        }
      });
    }
    return waitTime;
  };

  // Update the sorting logic so that:
  // 1. 'using' user is always on top
  // 2. 'urgent' users are next
  // 3. 'waiting' users are last
  const sortedUsers = users
  .sort((a, b) => {
    if (a.status === 'using') return -1; // 'using' should be first
    if (b.status === 'using') return 1;
    if (a.urgency && !b.urgency) return -1; // 'urgent' comes after 'using'
    if (!a.urgency && b.urgency) return 1;
    return a.timestamp - b.timestamp; // Otherwise, sort by timestamp
  });


  // Function to get the background color based on user status
  const getBackgroundColor = (user: User) => {
    if (user.status === 'using') return 'green.50'; // Go (Soft Green)
    if (user.urgency) return 'red.50'; // Urgent (Soft Red)
    return 'gray.50'; // Waiting (Soft Gray)
  };

  // Function to get the border color based on user status
  const getBorderColor = (user: User) => {
    if (user.status === 'using') return 'green.300'; // Go (Medium Green)
    if (user.urgency) return 'red.300'; // Urgent (Medium Red)
    return 'gray.300'; // Waiting (Medium Gray)
  };

  return (
    <ChakraProvider>
      <Box maxWidth="600px" margin="auto" padding={4}>
        <VStack spacing={6}>
          <Heading>Bathroom Queue Management</Heading>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Select
                placeholder="Select your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              >
                <option value="Krithik">Krithik</option>
                <option value="Nikita">Nikita</option>
                <option value="Grace">Grace</option>
                <option value="Shihao">Shihao</option>
                <option value="Viraat">Viraat</option>
              </Select>
              <CheckboxGroup
                colorScheme="blue"
                value={activities}
                onChange={(val: string[]) => setActivities(val)}
              >
                <VStack align="start">
                  {ACTIVITIES.map((activity) => (
                    <Checkbox key={activity.id} value={activity.id}>
                      {activity.label}
                    </Checkbox>
                  ))}
                </VStack>
              </CheckboxGroup>
              <Checkbox
                isChecked={urgency}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrgency(e.target.checked)}
              >
                Urgent (e.g., late for appointment)
              </Checkbox>
              <Button type="submit" colorScheme="blue">
                Add to Waitlist
              </Button>
            </VStack>
          </form>

          {/* Current Queue Display */}
          <Box>
            <Heading size="md" mb={4}>Current Queue</Heading>
            {users.length === 0 ? (
              <Text>No one is currently in the queue.</Text>
            ) : (
              <VStack align="stretch" spacing={4}>
                {sortedUsers.map((user, index) => (
                    <Box
                      key={user._id}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      bg={getBackgroundColor(user)}
                      borderColor={getBorderColor(user)}
                      boxShadow="sm"
                    >
                      <Heading size="sm" color={user.urgency ? 'red.600' : 'gray.700'}>
                        {`${index + 1}. ${user.name}`}
                      </Heading>
                      <Text fontSize="sm">
                        <strong>Status:</strong> {user.status}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Activities:</strong> {user.activities.join(', ')}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Urgency:</strong> {user.urgency ? 'Yes' : 'No'}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Estimated Wait Time:</strong> {calculateWaitTime(index)} mins
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        mt={2}
                        onClick={() => markAsUsing(user._id)}
                      >
                        Mark as Using
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        mt={2}
                        ml={2}
                        onClick={() => removeUser(user._id)}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Box>
    </ChakraProvider>
  );
}
