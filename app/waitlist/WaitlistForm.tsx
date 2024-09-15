// app/waitlist/WaitlistForm.tsx
"use client"; // Add this to make it a Client Component

import React, { useState, useEffect, FormEvent } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  Select,
  Checkbox,
  Button,
  useToast,
  CheckboxGroup,
} from '@chakra-ui/react';

type Activity = {
  id: string;
  label: string;
};

type User = {
  name: string;
  status: string;
  activities: string;
  urgency: boolean;
};

const ACTIVITIES: Activity[] = [
  { id: 'number1', label: 'Number 1 (1 min)' },
  { id: 'number2', label: 'Number 2 (4 min)' },
  { id: 'shave', label: 'Shave (3 min)' },
  { id: 'shower', label: 'Shower (15 min)' },
  { id: 'misc', label: 'Miscellaneous (5 min)' },
];

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

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
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
    try {
      const response = await fetch('http://localhost:3001/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, status, activities, urgency }),
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
          <Box>
            <Heading size="md">Current Queue</Heading>
            {users.length === 0 ? (
              <Text>No one is currently in the queue.</Text>
            ) : (
              <VStack align="stretch">
                {users.map((user, index) => (
                  <Text key={index}>
                    {`${index + 1}. ${user.name} - ${user.status} - ${
                      JSON.parse(user.activities).join(', ')
                    }${user.urgency ? ' (Urgent)' : ''}`}
                  </Text>
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Box>
    </ChakraProvider>
  );
}
