import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { fetchRewards } from "../api/savings";

interface Deal {
  id: string;
  title: string;
  description: string;
  discount: string;
  category: string;
  status: "active" | "expired" | "upcoming" | "used";
  expiryDate: string;
  usageCount: number;
  maxUsage: number;
  store: string;
  savings: string;
}

export const MyRegisteredDeals = ({ userId }: { userId: string }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserDeals() {
      try {
        const rewardsData = await fetchRewards(userId);

        if (rewardsData && rewardsData.length > 0) {
          // Transform the data to match our Deal interface
          const transformedDeals = rewardsData.map((reward: any) => ({
            id: reward.id,
            title: reward.title || "Special Discount",
            description: reward.description || "Exclusive member discount",
            discount: reward.discount_amount || "10%",
            category: reward.category || "General",
            status: reward.status || "active",
            expiryDate: reward.expiry_date || "2024-12-31",
            usageCount: reward.usage_count || 0,
            maxUsage: reward.max_usage || 5,
            store: reward.store || "Local Store",
            savings: reward.savings || "$5.00",
          }));
          setDeals(transformedDeals);
        } else {
          // Fallback data - vegetable discount
          setDeals([
            {
              id: "fallback-1",
              title: "Fresh Vegetable Discount",
              description: "Get 0.1% off on all fresh vegetables and fruits",
              discount: "0.1%",
              category: "Produce",
              status: "active",
              expiryDate: "2024-12-31",
              usageCount: 0,
              maxUsage: 10,
              store: "Local Grocery Store",
              savings: "$0.50",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching deals:", error);
        // Fallback data on error
        setDeals([
          {
            id: "fallback-1",
            title: "Fresh Vegetable Discount",
            description: "Get 0.1% off on all fresh vegetables and fruits",
            discount: "0.1%",
            category: "Produce",
            status: "active",
            expiryDate: "2024-12-31",
            usageCount: 0,
            maxUsage: 10,
            store: "Local Grocery Store",
            savings: "$0.50",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserDeals();
    }
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-green-200 bg-green-50/60";
      case "expired":
        return "border-red-200 bg-red-50/60";
      case "upcoming":
        return "border-blue-200 bg-blue-50/60";
      case "used":
        return "border-purple-200 bg-purple-50/60";
      default:
        return "border-gray-200 bg-white/40";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "expired":
        return "bg-red-100 text-red-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "used":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateUsageProgress = (usageCount: number, maxUsage: number) => {
    return Math.round((usageCount / maxUsage) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200/50 mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            My Registered Deals & Discounts
          </h2>
          <p className="text-sm text-gray-600">Loading your active deals...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border-2 border-gray-200 bg-white/40"
            >
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200/50 mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          My Registered Deals & Discounts
        </h2>
        <p className="text-sm text-gray-600">
          Your active discounts and savings opportunities
        </p>
      </div>

      <div>
        <div className="space-y-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${getStatusColor(
                deal.status
              )}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{deal.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {deal.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Store: {deal.store}
                  </p>
                </div>
                <Badge className={getStatusBadgeColor(deal.status)}>
                  {deal.status === "active"
                    ? "Active"
                    : deal.status === "expired"
                    ? "Expired"
                    : deal.status === "used"
                    ? "Used"
                    : "Upcoming"}
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Usage Progress
                  </span>
                  <span className="text-sm text-gray-600">
                    {deal.usageCount}/{deal.maxUsage} used
                  </span>
                </div>
                <Progress
                  value={calculateUsageProgress(deal.usageCount, deal.maxUsage)}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Expires: {formatDate(deal.expiryDate)}
                  </span>
                  <span className="text-green-600 font-medium">
                    Save: {deal.savings}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    {deal.discount} discount
                  </p>
                  <p className="text-xs text-gray-500">
                    Category: {deal.category}
                  </p>
                </div>

                {deal.status === "active" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    ✓ Active
                  </Button>
                ) : deal.status === "expired" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-red-500 border-red-300"
                  >
                    Expired
                  </Button>
                ) : deal.status === "used" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-purple-500 border-purple-300"
                  >
                    ✓ Used
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-blue-500 border-blue-300"
                  >
                    Coming Soon
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Savings Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-2xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">💰</span>
            </div>
            <div>
              <p className="font-medium text-green-800">
                Total Savings This Month
              </p>
              <p className="text-sm text-green-700">
                You've saved $
                {deals
                  .reduce((total, deal) => {
                    const savings =
                      parseFloat(deal.savings.replace("$", "")) || 0;
                    return total + savings;
                  }, 0)
                  .toFixed(2)}{" "}
                across {deals.length} active deals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};