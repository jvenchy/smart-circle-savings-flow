import React from 'react';
import { Button } from '@/components/ui/button';

export const GroupDeals = ({ deals, joinDeal }) => (
  <div>
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200/50 mb-4">
      <h2 className="text-xl font-bold text-gray-900">Group Deals</h2>
      <p className="text-sm text-gray-600">Collective purchasing power</p>
    </div>

    <div>
      {deals && deals.length > 0 ? (
        deals.map((deal) => (
          <div key={deal.id} className="mb-4 p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 transition-all duration-300 hover:bg-white/60">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{deal.title}</h4>
                <p className="text-xs text-gray-600">{deal.description}</p>
              </div>
              <span className="text-xs text-orange-700 font-bold">{deal.discount_percentage}% off</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-green-600">{deal.product_category}</span>
              <span className="text-xs text-gray-500">Valid until: {deal.valid_until}</span>
            </div>
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={() => joinDeal(deal.id)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Join Deal
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-sm p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60">
          No group deals available.
        </div>
      )}
    </div>
  </div>
);