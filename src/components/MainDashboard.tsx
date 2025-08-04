
import React from 'react';
import { Header } from './Header';
import { FeatureTiles } from './FeatureTiles';
import { StreakTracker } from './StreakTracker';

export const MainDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <StreakTracker />
        <FeatureTiles />
      </main>
    </div>
  );
};
