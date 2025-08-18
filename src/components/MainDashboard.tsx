
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
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AboutUs } from './AboutUs';

type ActiveFeature = 'dashboard' | 'daily' | 'weekly' | 'principles' | 'profile' | 'auth' | 'about';

export const MainDashboard = () => {
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Family Pulse...</p>
        </div>
      </div>
    );
  }

  const renderActiveFeature = () => {
    // Show auth page if user requests it or if trying to access protected features while not logged in
    if (activeFeature === 'auth') {
      return <AuthPage />;
    }

    // If user is not logged in and trying to access protected features, show auth page
    if (!user && (activeFeature === 'daily' || activeFeature === 'weekly' || activeFeature === 'profile')) {
      return <AuthPage />;
    }

    switch (activeFeature) {
      case 'daily':
        return <DailyWorshipPlan />;
      case 'weekly':
        return <WeeklyWorshipPlan />;
      case 'principles':
        return <PrinciplesLibrary />;
      case 'profile':
        return <Dashboard />;
      case 'about':
        return <AboutUs />;
      default:
        return <FeatureTiles onNavigate={(feature) => setActiveFeature(feature)} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <Header 
          activeFeature={activeFeature} 
          onNavigate={setActiveFeature}
          isLoggedIn={!!user}
        />
        
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          {renderActiveFeature()}
        </main>
        
        <Toaster />
      </div>
    </ThemeProvider>
  );
};
