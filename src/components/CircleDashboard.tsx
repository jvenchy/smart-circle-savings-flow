import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const CircleDashboard = ({ circleId, members }) => (
  <Card className="border-green-200 shadow-lg">
    <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-bold text-gray-900">Circle ID: {circleId || 'N/A'}</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Your AI-matched circle</p>
        </div>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
          {members.length} Members Active
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="p-6">
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Circle Members</h4>
        <div className="grid grid-cols-3 gap-3">
          {members.map((member, idx) => (
            <div key={member} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-sm font-medium mb-2 bg-green-100 text-green-700 ring-2 ring-green-200">
                {member.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-xs text-gray-600 truncate">User ID</p>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);
