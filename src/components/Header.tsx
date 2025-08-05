
import React from 'react';
import { Heart, Home, Calendar, CalendarDays, BookOpen, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePrincipleReads } from '@/hooks/usePrincipleReads';
import { usePrinciplesContent } from '@/hooks/usePrinciplesContent';

type ActiveFeature = 'dashboard' | 'daily' | 'weekly' | 'principles' | 'profile';

interface HeaderProps {
  activeFeature: ActiveFeature;
  onNavigate: (feature: ActiveFeature) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeFeature, onNavigate }) => {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { getUnreadCount } = usePrincipleReads();
  const { principlesContent } = usePrinciplesContent();

  const handleSignOut = async () => {
    await signOut();
  };

  const getDisplayName = () => {
    if (profile?.family_name) {
      return `${profile.family_name}`;
    }
    return user?.email || 'User';
  };

  const principleIds = principlesContent.map(p => p.id);
  const unreadCount = getUnreadCount(principleIds);

  const navigationItems = [
    { id: 'dashboard' as const, label: 'Home', icon: Home },
    { id: 'daily' as const, label: 'Daily', icon: Calendar },
    { id: 'weekly' as const, label: 'Weekly', icon: CalendarDays },
    { 
      id: 'principles' as const, 
      label: 'Principles', 
      icon: BookOpen,
      hasNotification: unreadCount > 0
    },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Family Pulse</h1>
              <p className="text-sm text-gray-600">Welcome, {getDisplayName()}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map(({ id, label, icon: Icon, hasNotification }) => (
              <Button
                key={id}
                onClick={() => onNavigate(id)}
                variant={activeFeature === id ? "default" : "ghost"}
                className={`relative flex items-center space-x-2 ${
                  activeFeature === id 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {hasNotification && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Button>
            ))}
          </nav>

          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-3 flex overflow-x-auto space-x-2 pb-2">
          {navigationItems.map(({ id, label, icon: Icon, hasNotification }) => (
            <Button
              key={id}
              onClick={() => onNavigate(id)}
              variant={activeFeature === id ? "default" : "ghost"}
              className={`relative flex items-center space-x-1 whitespace-nowrap ${
                activeFeature === id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
              {hasNotification && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
};
