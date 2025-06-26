import React from 'react';

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to FreshCircle!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Smart Circles. Shared Savings. Join or log in to get started.
        </p>
        <a href="/home" className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
