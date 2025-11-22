import React from 'react';

const BadgeQuizWhiz: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      <circle cx="50" cy="50" r="45" fill="#86efac" />
      <path d="M30 50 L50 70 L70 30" stroke="#15803d" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="50" y="85" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#14532d" fontWeight="bold">QUIZ WHIZ</text>
    </g>
  </svg>
);

export default BadgeQuizWhiz;
