import { useState, useEffect } from 'react';
import { auth, database } from '../services/firebase';
import { ref, get } from 'firebase/database';
import { MatchingAlgorithm } from '../utils/matchingAlgorithm';

interface UserProfile {
  id: string;
  bio: string;
  gender: 'male' | 'female' | 'other';
  genderSeeking: 'male' | 'female' | 'other';
  answers: Record<string, string>;
  username: string;
  age: number;
}

export const useMatching = (currentUserId: string) => {
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUserId || !auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get current user's profile
        const userRef = ref(database, `users/${currentUserId}`);
        const userSnapshot = await get(userRef);
        if (!userSnapshot.exists()) {
          throw new Error('User profile not found');
        }
        const currentUser = { id: currentUserId, ...userSnapshot.val() };

        // Get all users
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        if (!usersSnapshot.exists()) {
          throw new Error('No users found');
        }

        // Convert users data to array and exclude current user
        const allUsers = Object.entries(usersSnapshot.val())
          .filter(([id]) => id !== currentUserId)
          .map(([id, profile]: [string, any]) => ({
            id,
            ...profile
          }));

        // Find matches using the matching algorithm
        const matchedProfiles = await MatchingAlgorithm.findMatches(currentUser, allUsers);
        setMatches(matchedProfiles);
      } catch (err) {
        console.error('Error in useMatching:', err);
        setError('Failed to load matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUserId]);

  return { matches, loading, error };
};