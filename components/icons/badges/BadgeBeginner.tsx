import React from 'react';

const BadgeBeginner: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      <circle cx="50" cy="50" r="45" fill="#fde047" />
      <path d="M50 15 L55 35 L75 35 L60 48 L65 68 L50 55 L35 68 L40 48 L25 35 L45 35 Z" fill="#fff" />
      <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#ca8a04" fontWeight="bold">BEGINNER</text>
    </g>
  </svg>
);

export default BadgeBeginner;
