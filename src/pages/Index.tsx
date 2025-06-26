
import React from 'react';
import { CircleDashboard } from '@/components/CircleDashboard';
import { WeekendChallenges } from '@/components/WeekendChallenges';
import { GroupDeals } from '@/components/GroupDeals';
import { SavingsAnalytics } from '@/components/SavingsAnalytics';
import { AINotifications } from '@/components/AINotifications';

const Index = () => {
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
                <p className="text-sm font-medium text-gray-900">Mark D.</p>
                <p className="text-xs text-green-600">Kensington New Parents</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-medium">MD</span>
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
          {/* Left Column - Dashboard & Challenges */}
          <div className="lg:col-span-2 space-y-6">
            <CircleDashboard />
            <WeekendChallenges />
          </div>
          
          {/* Right Column - Deals & Analytics */}
          <div className="space-y-6">
            <GroupDeals />
            <SavingsAnalytics />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
