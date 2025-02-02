'use client';
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        {/* Multiple circles with different rotation speeds and opacities */}
        <div className="relative w-32 h-32">
          {/* Outer circle */}
          <svg className="absolute w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
            <circle
              className="text-blue-500/30"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeDasharray="180 300"
              r="46"
              cx="50"
              cy="50"
            />
          </svg>

          {/* Middle circle */}
          <svg className="absolute w-full h-full animate-[spin_2.5s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <circle
              className="text-blue-500/40"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeDasharray="150 300"
              r="38"
              cx="50"
              cy="50"
            />
          </svg>

          {/* Inner circle */}
          <svg className="absolute w-full h-full animate-[spin_2s_linear_infinite]" viewBox="0 0 100 100">
            <circle
              className="text-blue-500/50"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeDasharray="120 300"
              r="30"
              cx="50"
              cy="50"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">Loading</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add to your global CSS or tailwind config


export default LoadingSpinner;