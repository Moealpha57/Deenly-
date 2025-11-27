import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    aria-label="Deenie Logo"
    {...props}
  >
    <g transform="rotate(-15 50 50) scale(0.95) translate(2, 2)">
      {/* Main moon shape */}
      <path
        d="M50,5C25.2,5,5,25.2,5,50s20.2,45,45,45c11.7,0,22.5-4.5,30.6-11.9C67,80.4,59.3,71.5,59.3,60.7c0-15,12.2-27.2,27.2-27.2c3.5,0,6.9,0.7,10,1.9C92,19.3,72.6,5,50,5z"
        className="fill-current text-amber-400"
      />
    </g>
  </svg>
);

export default Logo;