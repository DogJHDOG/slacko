import React from 'react';

const ProgressRing = ({ progress, size = 40, strokeWidth = 3, showLabel = true, className = '' }) => {
  // Responsive size adjustments
  const responsiveSize = typeof size === 'object' ? size : {
    mobile: Math.max(24, size * 0.8),
    tablet: size,
    desktop: size
  };

  const actualSize = responsiveSize.mobile; // Base size for calculations
  const radius = (actualSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Mobile Size */}
      <div className="sm:hidden">
        <svg width={responsiveSize.mobile} height={responsiveSize.mobile} className="transform -rotate-90">
          <circle
            cx={responsiveSize.mobile / 2}
            cy={responsiveSize.mobile / 2}
            r={(responsiveSize.mobile - strokeWidth) / 2}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={responsiveSize.mobile / 2}
            cy={responsiveSize.mobile / 2}
            r={(responsiveSize.mobile - strokeWidth) / 2}
            stroke="url(#progressGradientMobile)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${(progress / 100) * ((responsiveSize.mobile - strokeWidth) * Math.PI)} ${(responsiveSize.mobile - strokeWidth) * Math.PI}`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="progressGradientMobile" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        {showLabel && (
          <span className="absolute text-xs font-semibold text-slate-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>

      {/* Tablet Size */}
      <div className="hidden sm:block lg:hidden">
        <svg width={responsiveSize.tablet} height={responsiveSize.tablet} className="transform -rotate-90">
          <circle
            cx={responsiveSize.tablet / 2}
            cy={responsiveSize.tablet / 2}
            r={(responsiveSize.tablet - strokeWidth) / 2}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={responsiveSize.tablet / 2}
            cy={responsiveSize.tablet / 2}
            r={(responsiveSize.tablet - strokeWidth) / 2}
            stroke="url(#progressGradientTablet)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${(progress / 100) * ((responsiveSize.tablet - strokeWidth) * Math.PI)} ${(responsiveSize.tablet - strokeWidth) * Math.PI}`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="progressGradientTablet" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        {showLabel && (
          <span className="absolute text-xs font-semibold text-slate-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>

      {/* Desktop Size */}
      <div className="hidden lg:block">
        <svg width={responsiveSize.desktop} height={responsiveSize.desktop} className="transform -rotate-90">
          <circle
            cx={responsiveSize.desktop / 2}
            cy={responsiveSize.desktop / 2}
            r={(responsiveSize.desktop - strokeWidth) / 2}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={responsiveSize.desktop / 2}
            cy={responsiveSize.desktop / 2}
            r={(responsiveSize.desktop - strokeWidth) / 2}
            stroke="url(#progressGradientDesktop)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="progressGradientDesktop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        {showLabel && (
          <span className="absolute text-xs sm:text-sm font-semibold text-slate-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;