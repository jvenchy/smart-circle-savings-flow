import { useState, useEffect } from 'react';
import { getUserCircle, getCircleMembers } from '../api/circles';

export function useCircle(userId: string) {
  const [circleId, setCircleId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCircle() {
      const assignedCircleId = await getUserCircle(userId);
      setCircleId(assignedCircleId);
      if (assignedCircleId) {
        const members = await getCircleMembers(assignedCircleId);
        setMembers(members);
      }
    }
    if (userId) fetchCircle();
  }, [userId]);

  return { circleId, members };
} 