// components/LogoPlaceholder.js
import React from 'react';
import { useTheme } from '@mui/material/styles';

const LogoPlaceholder = ({ width = 180, height = 40, ...props }) => {
  const theme = useTheme();
  
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 180 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.palette.primary.main} />
          <stop offset="100%" stopColor={theme.palette.secondary.main} />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Logo elements */}
      <g filter="url(#glow)">
        {/* Reticle circle */}
        <circle cx="25" cy="20" r="15" stroke="url(#logoGradient)" strokeWidth="1.5" fill="none" />
        
        {/* Reticle crosshairs */}
        <line x1="25" y1="5" x2="25" y2="35" stroke="url(#logoGradient)" strokeWidth="1" />
        <line x1="10" y1="20" x2="40" y2="20" stroke="url(#logoGradient)" strokeWidth="1" />
        
        {/* Reticle inner elements */}
        <circle cx="25" cy="20" r="3" fill="url(#logoGradient)" />
        
        {/* Circular segment */}
        <path 
          d="M 40 20 A 15 15 0 0 1 25 35" 
          stroke="url(#logoGradient)" 
          strokeWidth="1.5" 
          fill="none" 
          strokeDasharray="5,3"
        />
        
        {/* Text */}
        <text x="50" y="17" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="white">
          RETICULI
        </text>
        <text x="50" y="32" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="300" fill="white">
          TECHNOLOGIES
        </text>
      </g>
    </svg>
  );
};

export default LogoPlaceholder;