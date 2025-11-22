import React from 'react';

const BadgeWiseOwl: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" fill="#c4b5fd" />
      
      {/* Branch */}
      <path d="M20 80 Q50 75 80 80" stroke="#6b21a8" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Owl Body */}
      <path d="M50 30 C 35 30, 30 50, 30 60 C 30 75, 40 80, 50 80 C 60 80, 70 75, 70 60 C 70 50, 65 30, 50 30 Z" fill="#9333ea" />
      
      {/* Owl Belly */}
      <path d="M50 55 C 42 55, 40 65, 40 70 C 40 75, 45 78, 50 78 C 55 78, 60 75, 60 70 C 60 65, 58 55, 50 55 Z" fill="#a78bfa" />
      
      {/* Eyes */}
      <circle cx="42" cy="48" r="8" fill="white" />
      <circle cx="42" cy="48" r="4" fill="black" />
      <circle cx="58" cy="48" r="8" fill="white" />
      <circle cx="58" cy="48" r="4" fill="black" />
      
      {/* Beak */}
      <path d="M48 52 L52 52 L50 56 Z" fill="#f59e0b" />

      {/* Ear Tufts */}
      <path d="M40 30 L35 20 L45 32" fill="#9333ea" stroke="#7e22ce" strokeWidth="1" />
      <path d="M60 30 L65 20 L55 32" fill="#9333ea" stroke="#7e22ce" strokeWidth="1" />
      
      <text x="50" y="90" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#4c1d95" fontWeight="bold">WISE OWL</text>
    </g>
  </svg>
);

export default BadgeWiseOwl;