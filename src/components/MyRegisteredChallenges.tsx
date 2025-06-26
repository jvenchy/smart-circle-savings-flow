import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { fetchChallengeParticipations } from "../api/savings";

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  participants: number;
  totalMembers: number;
  progress: number;
  current: string;
  goal: string;
  timeLeft: string;
  status: "participating" | "completed" | "expired" | "upcoming";
  category: string;
  store: string;
  personalProgress: number;
  personalContribution: string;
}

export const MyRegisteredChallenges = ({ userId }: { userId: string }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserChallenges() {
      try {
        const participationsData = await fetchChallengeParticipations(userId);

        if (participationsData && participationsData.length > 0) {
          // Transform the data to match our Challenge interface
          const transformedChallenges = participationsData.map(
            (participation: any) => ({
              id: participation.challenge_id || participation.id,
              title: participation.title || "Team Challenge",
              description:
                participation.description || "Group savings challenge",
              reward: participation.reward || "$200 cash split",
              participants: participation.participants || 4,
              totalMembers: participation.total_members || 6,
              progress: participation.progress || 65,
              current: participation.current || "$130",
              goal: participation.goal || "$200",
              timeLeft: participation.time_left || "2 days",
              status: participation.status || "participating",
              category: participation.category || "General",
              store: participation.store || "Local Store",
              personalProgress: participation.personal_progress || 0,
              personalContribution: participation.personal_contribution || "$0",
            })
          );
          setChallenges(transformedChallenges);
        } else {
          // Fallback data - Fresh Produce Power challenge
          setChallenges([
            {
              id: "fallback-fresh-produce",
              title: "Fresh Produce Power",
              description: "Spend $200+ on fruits and vegetables as a group",
              reward: "$60 cash split",
              participants: 4,
              totalMembers: 6,
              progress: 65,
              current: "$130",
              goal: "$200",
              timeLeft: "2 days",
              status: "participating",
              category: "Produce",
              store: "Local Grocery Store",
              personalProgress: 0,
              personalContribution: "$0",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
        // Fallback data on error
        setChallenges([
          {
            id: "fallback-fresh-produce",
            title: "Fresh Produce Power",
            description: "Spend $200+ on fruits and vegetables as a group",
            reward: "$60 cash split",
            participants: 4,
            totalMembers: 6,
            progress: 65,
            current: "$130",
            goal: "$200",
            timeLeft: "2 days",
            status: "participating",
            category: "Produce",
            store: "Local Grocery Store",
            personalProgress: 0,
            personalContribution: "$0",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserChallenges();
    }
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "participating":
        return "border-green-200 bg-green-50/60";
      case "completed":
        return "border-purple-200 bg-purple-50/60";
      case "expired":
        return "border-red-200 bg-red-50/60";
      case "upcoming":
        return "border-blue-200 bg-blue-50/60";
      default:
        return "border-gray-200 bg-white/40";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "participating":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-purple-100 text-purple-700";
      case "expired":
        return "bg-red-100 text-red-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleVisitStore = (store: string) => {
    // This would typically open a map or store locator
    alert(`Opening directions to ${store}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200/50 mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            My Registered Challenges
          </h2>
          <p className="text-sm text-gray-600">
            Loading your active challenges...
          </p>
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
          My Registered Challenges
        </h2>
        <p className="text-sm text-gray-600">
          Your active team challenges and progress
        </p>
      </div>

      <div>
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${getStatusColor(
                challenge.status
              )}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {challenge.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {challenge.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Store: {challenge.store}
                  </p>
                </div>
                <Badge className={getStatusBadgeColor(challenge.status)}>
                  {challenge.status === "participating"
                    ? "Participating"
                    : challenge.status === "completed"
                    ? "Completed"
                    : challenge.status === "expired"
                    ? "Expired"
                    : "Upcoming"}
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Team Progress
                  </span>
                  <span className="text-sm text-gray-600">
                    {challenge.participants}/{challenge.totalMembers} members
                  </span>
                </div>
                <Progress value={challenge.progress} className="mb-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {challenge.current} of {challenge.goal}
                  </span>
                  <span className="text-green-600 font-medium">
                    {challenge.timeLeft} left
                  </span>
                </div>
              </div>

              {/* Personal Progress Section */}
              <div className="mb-3 p-3 bg-white/40 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Your Contribution
                  </span>
                  <span className="text-sm text-gray-600">
                    {challenge.personalContribution}
                  </span>
                </div>
                <Progress value={challenge.personalProgress} className="mb-2" />
                <p className="text-xs text-gray-500">
                  Help your team reach the goal!
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    {challenge.reward}
                  </p>
                  <p className="text-xs text-gray-500">
                    Category: {challenge.category}
                  </p>
                </div>

                {challenge.status === "participating" ? (
                  <Button
                    size="sm"
                    onClick={() => handleVisitStore(challenge.store)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Visit Store
                  </Button>
                ) : challenge.status === "completed" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="border-purple-300 text-purple-700"
                  >
                    ✓ Completed
                  </Button>
                ) : challenge.status === "expired" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-red-500 border-red-300"
                  >
                    Expired
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

        {/* Challenge Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-2xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🏆</span>
            </div>
            <div>
              <p className="font-medium text-green-800">Challenge Summary</p>
              <p className="text-sm text-green-700">
                You're participating in{" "}
                {challenges.filter((c) => c.status === "participating").length}{" "}
                active challenges
                {challenges.filter((c) => c.status === "completed").length >
                  0 &&
                  ` and completed ${
                    challenges.filter((c) => c.status === "completed").length
                  } challenges`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};