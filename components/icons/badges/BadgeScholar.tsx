import React from 'react';

const BadgeScholar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      <circle cx="50" cy="50" r="45" fill="#d8b4fe" />
      <path d="M25 75 L25 40 Q50 30 75 40 L75 75 L50 85 Z" fill="#a855f7" />
      <path d="M25 40 L50 50 L75 40 L50 30 Z" fill="#c084fc" />
      <text x="50" y="25" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#581c87" fontWeight="bold">SCHOLAR</text>
    </g>
  </svg>
);

export default BadgeScholar;
