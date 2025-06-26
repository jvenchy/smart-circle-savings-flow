import { useState, useEffect } from 'react';
import { fetchRewards, fetchChallengeParticipations } from '../api/savings';

export function useSavings(userId: string) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);

  useEffect(() => {
    async function getStats() {
      const rewardsData = await fetchRewards(userId);
      setRewards(rewardsData || []);
      const participationsData = await fetchChallengeParticipations(userId);
      setParticipations(participationsData || []);
    }
    if (userId) getStats();
  }, [userId]);

  return { rewards, participations };
} 