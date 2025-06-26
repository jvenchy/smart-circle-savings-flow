
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const GroupDeals = () => {
  const [joinedDeals, setJoinedDeals] = useState(new Set([1]));

  const deals = [
    {
      id: 1,
      title: "Organic Baby Food Bundle",
      description: "PC Organics baby food variety pack",
      discount: "25% off",
      originalPrice: "$24.99",
      groupPrice: "$18.74",
      needed: 3,
      current: 2,
      timeLeft: "6 hours",
      category: "Baby Care",
      status: "active"
    },
    {
      id: 2,
      title: "Fresh Atlantic Salmon",
      description: "Premium wild-caught salmon fillets",
      discount: "20% off",
      originalPrice: "$16.99/lb",
      groupPrice: "$13.59/lb",
      needed: 4,
      current: 1,
      timeLeft: "2 days",
      category: "Fresh Seafood",
      status: "available"
    },
    {
      id: 3,
      title: "Eco-Friendly Diapers",
      description: "Bambo Nature size 3 diapers",
      discount: "30% off",
      originalPrice: "$54.99",
      groupPrice: "$38.49",
      needed: 3,
      current: 3,
      timeLeft: "Locked in!",
      category: "Baby Care",
      status: "locked"
    }
  ];

  const handleJoinDeal = (dealId: number) => {
    setJoinedDeals(prev => new Set([...prev, dealId]));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-orange-200 bg-orange-50';
      case 'locked': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-orange-100 text-orange-700';
      case 'locked': return 'bg-green-100 text-green-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-100 border-b border-purple-200">
        <CardTitle className="text-xl font-bold text-gray-900">Group Deals</CardTitle>
        <p className="text-sm text-gray-600">Collective purchasing power</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.id} className={`p-4 rounded-lg border-2 transition-all duration-200 ${getStatusColor(deal.status)}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{deal.title}</h4>
                    <Badge className="text-xs bg-gray-100 text-gray-600">
                      {deal.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{deal.description}</p>
                </div>
                <Badge className={getStatusBadge(deal.status)}>
                  {deal.discount}
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex space-x-4">
                    <span className="text-sm text-gray-500 line-through">{deal.originalPrice}</span>
                    <span className="text-sm font-bold text-green-600">{deal.groupPrice}</span>
                  </div>
                  <span className="text-xs text-gray-500">{deal.timeLeft}</span>
                </div>
                
                {deal.status !== 'locked' && (
                  <>
                    <Progress value={(deal.current / deal.needed) * 100} className="mb-2" />
                    <p className="text-xs text-gray-600">
                      {deal.current} of {deal.needed} members needed
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                {deal.status === 'locked' ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled
                    className="border-green-300 text-green-700"
                  >
                    ✓ Deal Locked
                  </Button>
                ) : joinedDeals.has(deal.id) ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100"
                  >
                    ✓ You're In
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => handleJoinDeal(deal.id)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Join Deal
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Recommendation */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">AI</span>
            </div>
            <div>
              <p className="font-medium text-blue-800">Smart Suggestion</p>
              <p className="text-sm text-blue-700">Your circle often buys cleaning supplies together. New deal coming Monday!</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
