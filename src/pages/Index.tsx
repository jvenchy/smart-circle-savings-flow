import React from 'react';
import { Link } from 'react-router-dom';
import ShinyText from '../components/ShinyText';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">SmartCircles</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Home
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Features
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                How it Works
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="text-center pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black mb-6 text-gray-900">
              group up automatically,<br />
              <ShinyText 
                text="save more, earn cash" 
                disabled={false} 
                speed={3} 
                className="text-orange-600 italic" 
              />
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-12 mx-auto leading-relaxed">
              we connect you with neighbors who share your shopping goals so you can save more together.
            </p>

            <Link 
                to="/home" 
                className="bg-gradient-to-r mt-6 from-orange-500 to-orange-600 text-white text-2xl px-12 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:-translate-y-0.5 inline-block"
              >
                let's go!
              </Link>
          </div>
        </section>

        {/* Services Section */}
        <section className="pt-8 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              
              {/* Smart Circle Formation */}
              <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl">
                <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-red-200 to-red-300 rounded-3xl flex items-center justify-center border-2 border-white/80 shadow-xl">
                  <img src="/network.png" alt="Network" className="rounded-3xl w-64 h-64" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Smart Circle Formation
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  AI automatically groups you with compatible shoppers based on location, life stage, and spending patterns for effortless coordination.
                </p>
              </div>

              {/* Group Deals & Savings */}
              <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl">
                <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-orange-200 to-orange-300 rounded-3xl flex items-center justify-center border-2 border-white/80 shadow-xl">
                  <img src="/shopping cart.png" alt="Shopping Cart" className="rounded-3xl w-64 h-64" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Group Deals & Savings
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Unlock exclusive discounts and volume pricing when your circle shops together. Save 15-25% on everyday essentials automatically.
                </p>
              </div>

              {/* Weekend Challenges */}
              <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/80 transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl">
                <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-3xl flex items-center justify-center border-2 border-white/80 shadow-xl">
                  <img src="/trophy.png" alt="Trophy" className="rounded-3xl w-64 h-64" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Weekend Challenges
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Participate in opt-in team goals with real cash rewards. Earn money while discovering new products with your circle.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;