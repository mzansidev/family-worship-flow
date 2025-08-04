
import React, { useState } from 'react';
import { Header } from './Header';
import { FeatureTiles } from './FeatureTiles';
import { DailyWorshipPlan } from './DailyWorshipPlan';
import { WeeklyWorshipPlan } from './WeeklyWorshipPlan';
import { PrinciplesLibrary } from './PrinciplesLibrary';
import { Dashboard } from './Dashboard';
import { AuthPage } from './AuthPage';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';

type ActiveFeature = 'dashboard' | 'daily' | 'weekly' | 'principles' | 'profile';

export const MainDashboard = () => {
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Family Pulse...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'daily':
        return <DailyWorshipPlan />;
      case 'weekly':
        return <WeeklyWorshipPlan />;
      case 'principles':
        return <PrinciplesLibrary />;
      case 'profile':
        return <Dashboard />;
      default:
        return <FeatureTiles onTileClick={setActiveFeature} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header 
        activeFeature={activeFeature} 
        onNavigate={setActiveFeature}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {renderActiveFeature()}
      </main>
      
      <Toaster />
    </div>
  );
};
