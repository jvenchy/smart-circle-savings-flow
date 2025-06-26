import { useState, useEffect } from 'react';
import { fetchDeals, joinDeal } from '../api/deals';

export function useDeals(userId: string, circleId: string) {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    async function getDeals() {
      const data = await fetchDeals();
      setDeals(data || []);
    }
    getDeals();
  }, []);

  const join = async (dealId: string) => {
    await joinDeal(dealId, userId, circleId);
    // Optionally refresh deals
    const data = await fetchDeals();
    setDeals(data || []);
  };

  return { deals, join };
} 