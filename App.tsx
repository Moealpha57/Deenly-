import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import AppContent from './AppContent'; // We'll move the original App logic to this new component

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
