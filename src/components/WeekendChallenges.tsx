
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const WeekendChallenges = () => {
  const [joinedChallenges, setJoinedChallenges] = useState(new Set([1]));

  const challenges = [
    {
      id: 1,
      title: "Fresh Produce Power",
      description: "Spend $200+ on fruits and vegetables as a group",
      reward: "$60 cash split",
      participants: 4,
      totalMembers: 6,
      progress: 65,
      current: "$130",
      goal: "$200",
      timeLeft: "2 days",
      status: "active"
    },
    {
      id: 2,
      title: "Canadian Made Weekend",
      description: "Buy 10+ Canadian-made products together",
      reward: "$40 credit each",
      participants: 0,
      totalMembers: 6,
      progress: 0,
      current: "0",
      goal: "10 products",
      timeLeft: "Available Friday",
      status: "upcoming"
    }
  ];

  const handleJoinChallenge = (challengeId: number) => {
    setJoinedChallenges(prev => new Set([...prev, challengeId]));
  };

  const handleLeaveChallenge = (challengeId: number) => {
    setJoinedChallenges(prev => {
      const newSet = new Set(prev);
      newSet.delete(challengeId);
      return newSet;
    });
  };

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b border-blue-200">
        <CardTitle className="text-xl font-bold text-gray-900">Weekend Challenges</CardTitle>
        <p className="text-sm text-gray-600">Opt-in team goals with real cash rewards</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              challenge.status === 'active' 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                </div>
                <Badge className={`${
                  challenge.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {challenge.participants}/{challenge.totalMembers} joined
                </Badge>
              </div>

              {challenge.status === 'active' && (
                <div className="mb-3">
                  <Progress value={challenge.progress} className="mb-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{challenge.current} of {challenge.goal}</span>
                    <span className="text-green-600 font-medium">{challenge.timeLeft} left</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-600">{challenge.reward}</p>
                  {challenge.status === 'upcoming' && (
                    <p className="text-xs text-gray-500">{challenge.timeLeft}</p>
                  )}
                </div>
                
                {challenge.status === 'active' ? (
                  joinedChallenges.has(challenge.id) ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLeaveChallenge(challenge.id)}
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      ✓ Participating
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Count me in!
                    </Button>
                  )
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    className="text-gray-500"
                  >
                    Coming Soon
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Success */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <div>
              <p className="font-medium text-green-800">Last Week's Success!</p>
              <p className="text-sm text-green-700">"Organic Baby Food Challenge" - You earned $12</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
