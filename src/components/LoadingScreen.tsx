import React, { useState, useEffect } from 'react';

// Mock API functions - replace with actual API endpoints
const analyzeTransactionHistory = async (userId) => {
  // Placeholder for shopping analysis algorithm
  return new Promise(resolve => setTimeout(resolve, 3000));
};

const findCircle = async (userId) => {
  // Placeholder for circle matching algorithm
  return new Promise(resolve => setTimeout(resolve, 2500));
};

const loadUserCircle = async (userId) => {
  // Placeholder for loading user's circle data
  return new Promise(resolve => setTimeout(resolve, 1500));
};

const checkUserHasCircle = async (userId) => {
  // Placeholder - check if user already has a circle
  // In real implementation, this would check the database
  return new Promise(resolve => 
    setTimeout(() => resolve(Math.random() > 0.5), 500)
  );
};

const LoadingScreen = ({ userId, onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState('checking');
  const [hasExistingCircle, setHasExistingCircle] = useState(false);

  useEffect(() => {
    const runInitialization = async () => {
      try {
        // First, check if user already has a circle
        const userHasCircle = await checkUserHasCircle(userId);
        setHasExistingCircle(userHasCircle);

        if (userHasCircle) {
          // Skip to loading circle for existing users
          setCurrentPhase('loading-circle');
          await loadUserCircle(userId);
        } else {
          // Full initialization flow for new users
          setCurrentPhase('analyzing');
          await analyzeTransactionHistory(userId);
          
          setCurrentPhase('finding-circle');
          await findCircle(userId);
          
          setCurrentPhase('loading-circle');
          await loadUserCircle(userId);
        }
        
        // Initialization complete
        onComplete();
      } catch (error) {
        console.error('Initialization failed:', error);
        // Could add error handling here
      }
    };

    runInitialization();
  }, [userId, onComplete]);

  const getLoadingText = () => {
    switch (currentPhase) {
      case 'checking':
        return 'Initializing';
      case 'analyzing':
        return 'Analyzing Transaction History';
      case 'finding-circle':
        return 'Finding a circle';
      case 'loading-circle':
        return 'Loading your circle';
      default:
        return 'Loading';
    }
  };

  const getSubText = () => {
    switch (currentPhase) {
      case 'analyzing':
        return 'Understanding your shopping patterns';
      case 'finding-circle':
        return 'Matching you with like-minded savers';
      case 'loading-circle':
        return 'Preparing your dashboard';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
      {/* Glassmorphism container */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 p-12 max-w-md w-full mx-4 text-center shadow-2xl">
        
        {/* Animated Shopping Cart */}
        <div className="mb-8 flex justify-center">
          <div className="text-6xl animate-bounce">
            🛒
          </div>
        </div>

        {/* SmartCircles Logo */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">SmartCircles</h1>
        
        {/* Main Loading Text */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {getLoadingText()}
            <span className="animate-pulse">
              <span className="animate-bounce inline-block" style={{ animationDelay: '0ms' }}>.</span>
              <span className="animate-bounce inline-block" style={{ animationDelay: '150ms' }}>.</span>
              <span className="animate-bounce inline-block" style={{ animationDelay: '300ms' }}>.</span>
            </span>
          </h2>
          
          {/* Subtitle text */}
          {getSubText() && (
            <p className="text-sm text-gray-600 italic">
              {getSubText()}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: 
                currentPhase === 'checking' ? '10%' :
                currentPhase === 'analyzing' ? '35%' :
                currentPhase === 'finding-circle' ? '70%' :
                currentPhase === 'loading-circle' ? '95%' : '100%'
            }}
          />
        </div>

        {/* Phase indicators */}
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <div className={`flex items-center space-x-1 ${
            ['analyzing', 'finding-circle', 'loading-circle'].includes(currentPhase) 
              ? 'text-orange-600' 
              : 'text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              ['analyzing', 'finding-circle', 'loading-circle'].includes(currentPhase)
                ? 'bg-orange-500' 
                : 'bg-gray-300'
            }`} />
            {!hasExistingCircle && <span>Analyze</span>}
          </div>
          
          <div className={`flex items-center space-x-1 ${
            ['finding-circle', 'loading-circle'].includes(currentPhase) 
              ? 'text-orange-600' 
              : 'text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              ['finding-circle', 'loading-circle'].includes(currentPhase)
                ? 'bg-orange-500' 
                : 'bg-gray-300'
            }`} />
            {!hasExistingCircle && <span>Match</span>}
          </div>
          
          <div className={`flex items-center space-x-1 ${
            currentPhase === 'loading-circle' 
              ? 'text-orange-600' 
              : 'text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              currentPhase === 'loading-circle'
                ? 'bg-orange-500' 
                : 'bg-gray-300'
            }`} />
            <span>Load</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo component to show the loading screen in action
const SmartCirclesApp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState('user-123'); // Mock user ID

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen userId={userId} onComplete={handleLoadingComplete} />;
  }

  // This would be your actual Home component
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">SmartCircles Dashboard</h1>
        <p className="text-gray-600">Welcome to your circle!</p>
        <button 
          onClick={() => setIsLoading(true)}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
        >
          Reload (Demo)
        </button>
      </div>
    </div>
  );
};

export default SmartCirclesApp;