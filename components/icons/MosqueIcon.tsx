
import React from 'react';

const MosqueIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {/* Main Building Base */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 21V12h8v9" />
    {/* Dome */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12a4 4 0 018 0v0H6v0z" />
    {/* Crescent on Dome */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 5.5A2 2 0 008.5 7.5a2 2 0 002-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 5.5a1.99 1.99 0 01-.144-.798" />
    {/* Minaret */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21V9h2v12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a1 1 0 011-1h0a1 1 0 011 1v2" />
  </svg>
);

export default MosqueIcon;
