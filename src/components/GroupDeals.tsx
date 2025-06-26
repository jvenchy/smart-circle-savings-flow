import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const GroupDeals = ({ deals, joinDeal }) => (
  <Card className="border-purple-200 shadow-lg">
    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-100 border-b border-purple-200">
      <CardTitle className="text-xl font-bold text-gray-900">Group Deals</CardTitle>
      <p className="text-sm text-gray-600">Collective purchasing power</p>
    </CardHeader>
    <CardContent className="p-6">
      {deals && deals.length > 0 ? (
        deals.map((deal) => (
          <div key={deal.id} className="mb-6 p-4 bg-white rounded-lg border border-purple-100">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{deal.title}</h4>
                <p className="text-xs text-gray-600">{deal.description}</p>
              </div>
              <span className="text-xs text-purple-700 font-bold">{deal.discount_percentage}% off</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-green-600">{deal.product_category}</span>
              <span className="text-xs text-gray-500">Valid until: {deal.valid_until}</span>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => joinDeal(deal.id)}>
                Join Deal
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-sm">No group deals available.</div>
      )}
    </CardContent>
  </Card>
);
