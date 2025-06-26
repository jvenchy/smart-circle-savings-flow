import React from 'react';
import { Badge } from '@/components/ui/badge';

export const CircleDashboard = ({ circleId, members }) => (
  <div>
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200/50 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Circle ID: {circleId || 'N/A'}</h2>
          <p className="text-sm text-gray-600 mt-1">Your AI-matched circle</p>
        </div>
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">
          {members.length} Members Active
        </Badge>
      </div>
    </div>

    <div>
      <h4 className="font-semibold text-gray-900 mb-3">Circle Members</h4>
      <div className="grid grid-cols-3 gap-3">
        {members.map((member, idx) => (
          <div key={member} className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-sm font-medium mb-2 bg-orange-100 text-orange-700 ring-2 ring-orange-200">
              {member.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-xs text-gray-600 truncate">User ID</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);