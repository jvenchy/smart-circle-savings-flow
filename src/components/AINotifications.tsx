import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export const AINotifications = () => {
  const [currentNotification, setCurrentNotification] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const notifications = [
    {
      id: 1,
      message: "Sarah started a bulk pasta purchase - join for 15% off!",
      type: "deal",
      action: "Join Deal",
      timeLeft: "4 hours left"
    },
    {
      id: 2,
      message: "Weekend challenge is 70% complete - you're so close!",
      type: "challenge",
      action: "View Progress",
      timeLeft: "2 days left"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNotification((prev) => (prev + 1) % notifications.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 3000);
  };

  if (!isVisible) return null;

  const notification = notifications[currentNotification];

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">AI</span>
            </div>
            <div>
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs text-orange-100">{notification.timeLeft}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              size="sm" 
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs"
            >
              {notification.action}
            </Button>
            <button 
              onClick={handleDismiss}
              className="text-white/70 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};