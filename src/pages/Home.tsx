import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCircle } from "../hooks/useCircle";
import { useDeals } from "../hooks/useDeals";
import { useChallenges } from "../hooks/useChallenges";
import { useSavings } from "../hooks/useSavings";
import { useNotifications } from "../hooks/useNotifications";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { supabase } from "../api/supabaseClient";
import { CircleDashboard } from "@/components/CircleDashboard";
import { GroupDeals } from "@/components/GroupDeals";
import { AINotifications } from "@/components/AINotifications";
import { LifeStageMatchingService } from "../api/circleMatchingAlgorithm";
import { WeekendChallenges } from "@/components/WeekendChallenges";
import { MyRegisteredDeals } from "@/components/MyRegisteredDeals";
import { MyRegisteredChallenges } from "@/components/MyRegisteredChallenges";
import { NearbyLocations } from "@/components/NearbyLocations";
import { SpendingHabitsInsights } from "@/components/SpendingHabitsInsights";

console.log("[Home] Rendering Home component");

// Loading Screen Component
const LoadingScreen = ({ userId, onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState("checking");
  const [hasExistingCircle, setHasExistingCircle] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("[Home] useEffect - Checking initialization status");
    const runInitialization = async () => {
      if (userId && !isInitialized) {
        console.log(
          `[Home] User found: ${userId}, checking initialization needs`
        );
        try {
          // Step 1: Check if user already has a circle
          setCurrentPhase("checking");
          // Always return false for the demo to show the full animation
          const userHasCircle = await checkUserHasCircle(userId);
          setHasExistingCircle(userHasCircle);

          // Full initialization flow for new users
          setCurrentPhase("analyzing");
          await analyzeTransactionHistory(userId);

          setCurrentPhase("finding-circle");
          await findCircle(userId);

          setCurrentPhase("loading-circle");
          await loadUserCircle(userId);

          // Initialization complete
          onComplete();
        } catch (error) {
          console.error("Initialization failed:", error);
          // Still complete to avoid infinite loading
          onComplete();
        }
      }
    };

    runInitialization();
  }, [userId, onComplete, isInitialized]);

  // API Functions (modified for demo purposes with delays)
  const checkUserHasCircle = async (userId: string) => {
    console.log("[Demo] Checking for circle...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // For the demo, we want the "new user" flow.
    return false;
  };

  const analyzeTransactionHistory = async (userId: string) => {
    console.log("[Demo] Analyzing transactions...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true, data: { classification: "Demo" } };
  };

  const findCircle = async (userId: string) => {
    console.log("[Demo] Finding a circle...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return true;
  };

  const loadUserCircle = async (userId: string) => {
    console.log("[Demo] Loading user circle...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return [];
  };

  const getLoadingText = () => {
    switch (currentPhase) {
      case "checking":
        return "Initializing";
      case "analyzing":
        return "Analyzing Transaction History";
      case "finding-circle":
        return "Finding a circle";
      case "loading-circle":
        return "Loading your circle";
      default:
        return "Loading";
    }
  };

  const getSubText = () => {
    switch (currentPhase) {
      case "analyzing":
        return "Understanding your shopping patterns";
      case "finding-circle":
        return "Matching you with like-minded savers";
      case "loading-circle":
        return "Preparing your dashboard";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
      {/* Glassmorphism container */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 p-12 max-w-md w-full mx-4 text-center shadow-2xl">
        {/* Animated Shopping Cart */}
        <div className="mb-8 flex justify-center">
          <div className="text-6xl animate-bounce">🛒</div>
        </div>

        {/* SmartCircles Logo */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">SmartCircles</h1>

        {/* Main Loading Text */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {getLoadingText()}
            <span className="animate-pulse">
              <span
                className="animate-bounce inline-block"
                style={{ animationDelay: "0ms" }}
              >
                .
              </span>
              <span
                className="animate-bounce inline-block"
                style={{ animationDelay: "150ms" }}
              >
                .
              </span>
              <span
                className="animate-bounce inline-block"
                style={{ animationDelay: "300ms" }}
              >
                .
              </span>
            </span>
          </h2>

          {/* Subtitle text */}
          {getSubText() && (
            <p className="text-sm text-gray-600 italic">{getSubText()}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{
              width:
                currentPhase === "checking"
                  ? "10%"
                  : currentPhase === "analyzing"
                  ? "35%"
                  : currentPhase === "finding-circle"
                  ? "70%"
                  : currentPhase === "loading-circle"
                  ? "95%"
                  : "100%",
            }}
          />
        </div>

        {/* Phase indicators */}
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <div
            className={`flex items-center space-x-1 ${
              ["analyzing", "finding-circle", "loading-circle"].includes(
                currentPhase
              )
                ? "text-orange-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                ["analyzing", "finding-circle", "loading-circle"].includes(
                  currentPhase
                )
                  ? "bg-orange-500"
                  : "bg-gray-300"
              }`}
            />
            {!hasExistingCircle && <span>Analyze</span>}
          </div>

          <div
            className={`flex items-center space-x-1 ${
              ["finding-circle", "loading-circle"].includes(currentPhase)
                ? "text-orange-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                ["finding-circle", "loading-circle"].includes(currentPhase)
                  ? "bg-orange-500"
                  : "bg-gray-300"
              }`}
            />
            {!hasExistingCircle && <span>Match</span>}
          </div>

          <div
            className={`flex items-center space-x-1 ${
              currentPhase === "loading-circle"
                ? "text-orange-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentPhase === "loading-circle"
                  ? "bg-orange-500"
                  : "bg-gray-300"
              }`}
            />
            <span>Load</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HardcodedCircleDashboard = ({ user }) => {
  // A static list of members for the demo circle
  const mockMembers = [
    { id: 2, full_name: "Sarah J.", avatar_url: "SJ" },
    { id: 3, full_name: "Mike L.", avatar_url: "ML" },
    { id: 4, full_name: "Emily C.", avatar_url: "EC" },
    { id: 5, full_name: "David H.", avatar_url: "DH" },
    { id: 6, full_name: "Jessica P.", avatar_url: "JP" },
  ];

  const radius = 120; // Radius of the circle in pixels
  const centerNodeSize = 80; // Size of the central user node
  const memberNodeSize = 64; // Size of the member nodes

  const getUserInitial = (user) => {
      const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "U";
      return name[0].toUpperCase();
  }

  return (
    <div className="bg-white/0 backdrop-blur-sm rounded-3xl p-6 transition-all duration-300 hover:shadow-xl mb-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Shopping Circle</h2>
      <p className="text-sm text-gray-600 mb-8">You and 5 others are saving together nearby!</p>
      
      <div className="relative w-full h-80 flex items-center justify-center">
        {/* The connecting ring */}
        <div 
          className="absolute border-2 border-dashed border-orange-300 rounded-full"
          style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
        ></div>

        {/* Current User (Center Node) */}
        <div 
          className="absolute z-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex flex-col items-center justify-center text-white shadow-lg"
          style={{ width: `${centerNodeSize}px`, height: `${centerNodeSize}px`}}
        >
          <span className="text-2xl font-bold">{getUserInitial(user)}</span>
          <span className="text-xs font-semibold">You</span>
        </div>

        {/* Circle Member Nodes */}
        {mockMembers.map((member, index) => {
          const angle = (index / mockMembers.length) * 2 * Math.PI;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          return (
            <div
              key={member.id}
              className="absolute z-10 bg-gray-200 rounded-full flex flex-col items-center justify-center border-2 border-white shadow-md"
              style={{
                width: `${memberNodeSize}px`,
                height: `${memberNodeSize}px`,
                transform: `translate(${x}px, ${y}px)`,
                transition: 'transform 0.5s ease-out',
              }}
              title={member.full_name}
            >
               <span className="text-xl font-bold text-gray-700">{member.avatar_url}</span>
               <span className="text-xs text-gray-500 truncate w-14 text-center">{member.full_name.split(' ')[0]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Home Component
export default function Home() {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();
  // MODIFIED: Start with the loading screen active.
  const [isInitializing, setIsInitializing] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const userId = user?.id;
  const { circleId, members } = useCircle(userId);
  const { deals, join: joinDeal } = useDeals(userId, circleId || "");
  const { challenges, join: joinChallenge } = useChallenges(
    userId,
    circleId || ""
  );
  const { rewards, participations } = useSavings(userId);
  const { notifications } = useNotifications(userId);

  // Mobile tab state
  const [tab, setTab] = useState<"circle" | "user">("circle");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // MODIFIED: Removed the useEffect that checks for initialization.
  // The loading screen is now shown by default via the isInitializing state.

  const handleInitializationComplete = () => {
    setIsInitializing(false);
    setIsInitialized(true);
    // MODIFIED: Removed window.location.reload() for a smoother transition.
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!userId) {
    navigate("/login");
    return null;
  }

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <LoadingScreen
        userId={userId}
        onComplete={handleInitializationComplete}
      />
    );
  }

  // Show main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header - Matching Landing Page Style */}
      <header className="bg-white/70 backdrop-blur-md border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-3xl font-bold text-gray-900">
                  SmartCircles
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Dashboard
              </a>
              <a
                href="TransactionDemo"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Transaction Classification Demo
              </a>
              <a
                href="/MatchingDemo"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Matching Algorithm Demo
              </a>
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.full_name ||
                      user?.user_metadata?.name ||
                      user?.email ||
                      "User"}
                  </p>
                  <p className="text-xs text-orange-600">
                    9034 points
                  </p>
                </div>
                <div
                  className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={handleLogout}
                  title="Log out"
                >
                  <span className="text-orange-600 font-medium">
                    {user?.user_metadata?.full_name?.[0] ||
                      user?.user_metadata?.name?.[0] ||
                      user?.email?.[0] ||
                      "U"}
                  </span>
                </div>
              </div>
            </nav>
            {/* Mobile user info */}
            <div className="md:hidden flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    user?.email ||
                    "User"}
                </p>
                <p className="text-xs text-orange-600">
                  Circle {circleId || "N/A"}
                </p>
              </div>
              <div
                className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center cursor-pointer"
                onClick={handleLogout}
                title="Log out"
              >
                <span className="text-orange-600 font-medium">
                  {user?.user_metadata?.full_name?.[0] ||
                    user?.user_metadata?.name?.[0] ||
                    user?.email?.[0] ||
                    "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* AI Notifications */}
      <AINotifications />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Tab Navigation */}
        {isMobile ? (
          <div className="mb-4 flex justify-center space-x-4">
            <button
              className={`px-4 py-2 rounded-full font-semibold ${
                tab === "circle"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-orange-500 border border-orange-500"
              }`}
              onClick={() => setTab("circle")}
            >
              Circle
            </button>
            <button
              className={`px-4 py-2 rounded-full font-semibold ${
                tab === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-orange-500 border border-orange-500"
              }`}
              onClick={() => setTab("user")}
            >
              My Account
            </button>
          </div>
        ) : null}

        <div
          className={isMobile ? "" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}
        >
          {/* Left Column - Circle Related Content */}
          {(isMobile ? tab === "circle" : true) && (
            <div className={isMobile ? "" : "lg:col-span-2 space-y-6"}>
              {/* Circle Dashboard */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 p-6 transition-all duration-300 hover:shadow-xl mb-6">
                <HardcodedCircleDashboard user={user} />
              </div>
              {/* Group Deals */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 p-6 transition-all duration-300 hover:shadow-xl mb-6">
                <GroupDeals deals={deals} joinDeal={joinDeal} />
              </div>
              {/* Weekly Challenges */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 p-6 transition-all duration-300 hover:shadow-xl">
                <WeekendChallenges />
              </div>
            </div>
          )}

          {/* Right Column - User Related Content */}
          {(isMobile ? tab === "user" : true) && (
            <div className={isMobile ? "" : "space-y-6"}>
              {/* My Registered Deals/Discounts and Status */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 p-6 transition-all duration-300 hover:shadow-xl mb-6">
                <MyRegisteredDeals userId={userId} />
              </div>
              {/* My Registered Challenges and Status */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 p-6 transition-all duration-300 hover:shadow-xl mb-6">
                <MyRegisteredChallenges userId={userId} />
              </div>
              {/* Usage Instructions */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 p-4 text-sm text-gray-600 mb-6">
                Your active deals and challenges will be automatically used at
                store checkout with your PC Optimum account.
              </div>
              {/* Nearby Locations for Rewards */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 p-6 transition-all duration-300 hover:shadow-xl mb-6">
                <NearbyLocations userId={userId} />
              </div>
              {/* My Spending Habits Insights */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 p-6 transition-all duration-300 hover:shadow-xl">
                <SpendingHabitsInsights userId={userId} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}