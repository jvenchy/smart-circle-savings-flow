
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const CircleDashboard = () => {
  const circleMembers = [
    { id: 1, initials: 'MD', name: 'Mark D.', stage: 'New Parent', activity: 'active' },
    { id: 2, initials: 'SL', name: 'Sarah L.', stage: 'New Parent', activity: 'active' },
    { id: 3, initials: 'JR', name: 'John R.', stage: 'New Parent', activity: 'inactive' },
    { id: 4, initials: 'AL', name: 'Anna L.', stage: 'New Parent', activity: 'active' },
    { id: 5, initials: 'MK', name: 'Mike K.', stage: 'New Parent', activity: 'active' },
    { id: 6, initials: 'TR', name: 'Tina R.', stage: 'New Parent', activity: 'active' }
  ];

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Kensington New Parents</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Your AI-matched circle • 3-5km radius</p>
          </div>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
            6 Members Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* This Month's Impact */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">This Month's Impact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">$127</p>
              <p className="text-sm text-gray-600">Circle Savings</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">$45</p>
              <p className="text-sm text-gray-600">Challenge Rewards</p>
            </div>
          </div>
        </div>

        {/* Current Weekend Goal */}
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-900">Weekend Challenge Active</h4>
            <Badge className="bg-orange-100 text-orange-700">4/6 Joined</Badge>
          </div>
          <p className="text-sm text-gray-700 mb-3">"Spend $200+ on fresh produce as a group"</p>
          <Progress value={65} className="mb-2" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">$130 of $200 goal</span>
            <span className="text-green-600 font-medium">$60 reward pool</span>
          </div>
        </div>

        {/* Circle Members */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Circle Members</h4>
          <div className="grid grid-cols-3 gap-3">
            {circleMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                  member.activity === 'active' 
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-200' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {member.initials}
                </div>
                <p className="text-xs text-gray-600 truncate">{member.stage}</p>
                <div className={`w-2 h-2 mx-auto mt-1 rounded-full ${
                  member.activity === 'active' ? 'bg-green-400' : 'bg-gray-300'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
