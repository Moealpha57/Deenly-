// FIX: Implement the ShareBadgeModal component which was missing. This resolves the parsing errors related to placeholder content.
import React, { useRef } from 'react';
import DownloadIcon from './icons/DownloadIcon';
import ShareIcon from './icons/ShareIcon';

interface ShareBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeName: string;
  badgeDescription: string;
  BadgeIconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

const ShareBadgeModal: React.FC<ShareBadgeModalProps> = ({
  isOpen,
  onClose,
  badgeName,
  badgeDescription,
  BadgeIconComponent,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) {
    return null;
  }

  const handleDownload = () => {
    // Placeholder for download logic
    alert('Download functionality coming soon!');
  };

  const handleShare = () => {
    // Placeholder for share logic
    if (navigator.share) {
      navigator.share({
        title: `I earned the ${badgeName} badge on Deenie!`,
        text: `Check out Deenie to learn about Islam. I just earned the "${badgeName}" badge!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Share functionality coming soon!');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-24 h-24 mx-auto mb-4">
          <BadgeIconComponent />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Congratulations!</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2">You've earned the</p>
        <p className="text-xl font-bold text-brand-primary mt-1 mb-2">{badgeName}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{badgeDescription}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <ShareIcon className="h-5 w-5" />
            <span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors"
          >
            <DownloadIcon className="h-5 w-5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareBadgeModal;