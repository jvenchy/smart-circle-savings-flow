
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SavingsAnalytics = () => {
  const monthlyData = [
    { month: 'Oct', savings: 89, challenges: 25 },
    { month: 'Nov', savings: 127, challenges: 45 },
    { month: 'Dec', savings: 156, challenges: 38 }
  ];

  const categories = [
    { name: 'Baby Care', amount: 45, percentage: 35 },
    { name: 'Fresh Produce', amount: 32, percentage: 25 },
    { name: 'Household', amount: 28, percentage: 22 },
    { name: 'Organic Foods', amount: 22, percentage: 18 }
  ];

  return (
    <Card className="border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-100 border-b border-indigo-200">
        <CardTitle className="text-xl font-bold text-gray-900">Your Savings</CardTitle>
        <p className="text-sm text-gray-600">Track your collective impact</p>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Total Impact */}
        <div className="mb-6">
          <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-50 rounded-lg border border-green-200">
            <p className="text-3xl font-bold text-green-600">$372</p>
            <p className="text-sm text-gray-600">Total Saved This Quarter</p>
            <p className="text-xs text-green-700 mt-1">↑ 28% vs last quarter</p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Monthly Progress</h4>
          <div className="space-y-3">
            {monthlyData.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <div className="flex-1 mx-3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${(month.savings / 200) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-green-600">${month.savings}</span>
                  <span className="text-xs text-gray-500 block">+${month.challenges} rewards</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Top Categories</h4>
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{category.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="font-medium text-gray-900 w-8">${category.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone */}
        <div className="mt-6 p-3 bg-gradient-to-r from-yellow-100 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 text-lg">🏆</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">Achievement Unlocked!</p>
              <p className="text-xs text-yellow-700">Saved $100+ for 3 months straight</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
