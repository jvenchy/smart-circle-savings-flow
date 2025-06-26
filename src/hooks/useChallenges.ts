import { useState, useEffect } from 'react';
import { fetchChallenges, joinChallenge } from '../api/challenges';
import { useCircle } from './useCircle';
import { useSavings } from './useSavings';
import { useDeals } from './useDeals';

export function useChallenges(userId: string, circleId: string) {
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    async function getChallenges() {
      const data = await fetchChallenges();
      setChallenges(data || []);
    }
    getChallenges();
  }, []);

  const join = async (challengeId: string) => {
    await joinChallenge(challengeId, userId, circleId);
    // Optionally refresh challenges
    const data = await fetchChallenges();
    setChallenges(data || []);
  };

  return { challenges, join };
} 