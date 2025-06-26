import React from 'react';
import { useCircle } from '../hooks/useCircle';
import { useDeals } from '../hooks/useDeals';
import { useChallenges } from '../hooks/useChallenges';
import { useSavings } from '../hooks/useSavings';
import { useNotifications } from '../hooks/useNotifications';
import { CircleDashboard } from '@/components/CircleDashboard';
import { GroupDeals } from '@/components/GroupDeals';
import { AINotifications } from '@/components/AINotifications';

// Placeholder user id (replace with real auth/user context)
const userId = 'user-123';

export default function Index() {
  const { circleId, members } = useCircle(userId);
  const { deals, join: joinDeal } = useDeals(userId, circleId || '');
  const { challenges, join: joinChallenge } = useChallenges(userId, circleId || '');
  const { rewards, participations } = useSavings(userId);
  const { notifications } = useNotifications(userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">FC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FreshCircle</h1>
                <p className="text-xs text-gray-500">Smart Circles. Shared Savings.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">User</p>
                <p className="text-xs text-green-600">Circle {circleId || 'N/A'}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* AI Notifications */}
      <AINotifications />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            <CircleDashboard circleId={circleId} members={members} />
          </div>
          {/* Right Column - Deals */}
          <div className="space-y-6">
            <GroupDeals deals={deals} joinDeal={joinDeal} />
          </div>
        </div>
      </main>
    </div>
  );
}
