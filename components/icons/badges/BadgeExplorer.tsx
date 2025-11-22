import React from 'react';

const BadgeExplorer: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      <circle cx="50" cy="50" r="45" fill="#7dd3fc" />
      <path d="M50 20 L70 70 L30 70 Z" fill="#fff" />
      <circle cx="50" cy="50" r="10" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
      <text x="50" y="85" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#0369a1" fontWeight="bold">EXPLORER</text>
    </g>
  </svg>
);

export default BadgeExplorer;
