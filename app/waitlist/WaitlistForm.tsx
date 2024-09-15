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

const MAX_WAIT_TIME = 20 * 60 * 1000; // 20 minutes in milliseconds

export default function WaitlistForm() {
  const [name, setName] = useState<string>('');
  const [status, setStatus] = useState<string>('');
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
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, status, activities, urgency, timestamp }),
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
      setStatus('');
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
      const response = await fetch(`/api/user/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove user');
      toast({
        title: 'User Removed',
        description: 'The user has been removed from the queue.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
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

  // Mark user as "Using"
  const markAsUsing = async (id: string) => {
    try {
      const response = await fetch(`/api/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'using' }),
      });
      if (!response.ok) throw new Error('Failed to update user');
      toast({
        title: 'User Updated',
        description: 'The user is now using the bathroom.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
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
              <Select
                placeholder="Select your status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="waiting">Waiting</option>
                <option value="using">Using</option>
                <option value="done">Done</option>
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
                Submit
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
                {users
                  .sort((a, b) => b.urgency - a.urgency || a.timestamp - b.timestamp)
                  .map((user, index) => (
                    <Box
                      key={user._id}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      bg={user.urgency ? 'red.100' : 'gray.100'}
                      borderColor={user.urgency ? 'red.400' : 'gray.400'}
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
