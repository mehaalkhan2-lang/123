import React from 'react';

export default function ScaLogo({ className = "w-8 h-8", textColor = "text-primary" }: { className?: string; textColor?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Background Circle */}
        <circle cx="50" cy="50" r="48" fill="url(#logo-grad)" />
        
        {/* Scientific Accents (Orbits) */}
        <circle cx="50" cy="50" r="35" stroke="white" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
        <ellipse cx="50" cy="50" rx="45" ry="15" stroke="white" strokeWidth="0.5" transform="rotate(45 50 50)" opacity="0.2" />
        <ellipse cx="50" cy="50" rx="45" ry="15" stroke="white" strokeWidth="0.5" transform="rotate(-45 50 50)" opacity="0.2" />
        
        {/* Atoms/Particles */}
        <circle cx="20" cy="30" r="3" fill="#f26c4f" />
        <circle cx="80" cy="40" r="2" fill="#f26c4f" />
        <circle cx="40" cy="80" r="4" fill="#f26c4f" />
        
        {/* Main Text */}
        <text 
          x="50" 
          y="58" 
          fill="white" 
          fontSize="32" 
          fontWeight="900" 
          fontFamily="serif" 
          textAnchor="middle" 
          style={{ fontStyle: 'italic' }}
        >
          SCA
        </text>
        
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e3a8a" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
