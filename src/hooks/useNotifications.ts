import { useState, useEffect } from 'react';
import { fetchNotifications } from '../api/notifications';

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function getNotifications() {
      const data = await fetchNotifications(userId);
      setNotifications(data || []);
    }
    if (userId) getNotifications();
  }, [userId]);

  return { notifications };
} 