
import React from 'react';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

type ActiveFeature = 'dashboard' | 'daily' | 'weekly' | 'principles' | 'profile';

interface HeaderProps {
  activeFeature: ActiveFeature;
  onNavigate: (feature: ActiveFeature) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeFeature, onNavigate }) => {
  const { user, signOut } = useAuth();

  const getTitle = () => {
    switch (activeFeature) {
      case 'daily': return 'Daily Worship';
      case 'weekly': return 'Weekly Plans';
      case 'principles': return 'Principles Library';
      case 'profile': return 'Dashboard';
      default: return 'Family Pulse';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {activeFeature !== 'dashboard' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{getTitle()}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {activeFeature !== 'dashboard' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            )}
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
