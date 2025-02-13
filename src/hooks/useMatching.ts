import { useState, useEffect } from 'react';
import { MatchingAlgorithm } from '../utils/matchingAlgorithm';
import { auth, database } from '../services/firebase';
import { ref, get } from 'firebase/database';

interface UserProfile {
  id: string;
  bio: string;
  gender: 'male' | 'female' | 'other';
  genderSeeking: 'male' | 'female' | 'other';
  answers: Record<string, string>;
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
        
        // Fetch all users from Firebase
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        if (!snapshot.exists()) {
          setMatches([]);
          setLoading(false);
          return;
        }

        const usersData = snapshot.val();
        const profiles = Object.entries(usersData).map(([id, data]: [string, any]) => ({
          id,
          bio: data.bio || '',
          gender: data.gender || 'other',
          genderSeeking: data.genderSeeking || 'other',
          answers: data.answers || {},
          username: data.username || '',
          age: data.age || 18
        }));

        const currentUser = profiles.find(p => p.id === currentUserId);
        if (!currentUser) {
          setError('Profile not found');
          setLoading(false);
          return;
        }

        const potentialMatches = profiles.filter(p => 
          p.id !== currentUserId && 
          p.gender === currentUser.genderSeeking &&
          p.genderSeeking === currentUser.gender
        );

        const compatibleMatches = await MatchingAlgorithm.findMatches(
          currentUser,
          potentialMatches
        );

        setMatches(compatibleMatches);
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