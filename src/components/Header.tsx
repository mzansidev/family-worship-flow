
import React from 'react';
import { BookOpen, User, LogIn, LogOut, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './ThemeToggle';

type ActiveFeature = 'dashboard' | 'daily' | 'weekly' | 'principles' | 'profile' | 'auth' | 'about';

interface HeaderProps {
  activeFeature: ActiveFeature;
  onNavigate: (feature: ActiveFeature) => void;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeFeature, onNavigate, isLoggedIn }) => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully"
      });
    }
  };

  const navItems = [
    { key: 'dashboard' as const, label: 'Home', icon: BookOpen },
    { key: 'daily' as const, label: 'Daily', icon: BookOpen },
    { key: 'weekly' as const, label: 'Weekly', icon: BookOpen },
    { key: 'principles' as const, label: 'Principles', icon: BookOpen },
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'about' as const, label: 'About', icon: Info },
  ];

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Family Pulse
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  variant={activeFeature === item.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate(item.key)}
                  className={activeFeature === item.key ? 'bg-blue-100 text-blue-700' : ''}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {isLoggedIn ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button
                onClick={() => onNavigate('auth')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-3 flex items-center space-x-1 overflow-x-auto">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant={activeFeature === item.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate(item.key)}
              className={`whitespace-nowrap ${activeFeature === item.key ? 'bg-blue-100 text-blue-700' : ''}`}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
};
