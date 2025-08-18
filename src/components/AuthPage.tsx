
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onSuccessfulAuth?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccessfulAuth }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Password Reset Sent",
            description: "Check your email for password reset instructions"
          });
          setMode('login');
        }
      } else {
        const { error } = mode === 'login' 
          ? await signIn(email, password)
          : await signUp(email, password);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else if (mode === 'signup') {
          toast({
            title: "Success",
            description: "Please check your email to confirm your account"
          });
        } else {
          // Successful login
          toast({
            title: "Success",
            description: "Welcome back!"
          });
          if (onSuccessfulAuth) {
            onSuccessfulAuth();
          }
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getModeText = () => {
    switch (mode) {
      case 'login': return { title: 'Welcome back!', button: 'Sign In' };
      case 'signup': return { title: 'Join us today!', button: 'Sign Up' };
      case 'reset': return { title: 'Reset your password', button: 'Send Reset Email' };
    }
  };

  const modeText = getModeText();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Family Pulse</h1>
          <p className="text-gray-600 mt-2">{modeText.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {mode !== 'reset' && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : modeText.button}
          </Button>
        </form>

        <div className="mt-4 space-y-2 text-center">
          {mode === 'reset' ? (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-blue-600 hover:text-blue-700 text-sm block"
              >
                {mode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
              
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-blue-600 hover:text-blue-700 text-sm block"
                >
                  Forgot your password?
                </button>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
```

Now I need to add the resetPassword function to the useAuth hook:

<lov-write file_path="src/hooks/useAuth.tsx">
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };
};
```

Now I need to update the MainDashboard to handle successful authentication and redirect properly:

<lov-write file_path="src/components/MainDashboard.tsx">
import React, { useState, useEffect } from 'react';
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

  // Redirect to dashboard when user logs in
  useEffect(() => {
    if (user && activeFeature === 'auth') {
      setActiveFeature('dashboard');
    }
  }, [user, activeFeature]);

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

  const handleSuccessfulAuth = () => {
    setActiveFeature('dashboard');
  };

  const renderActiveFeature = () => {
    // Show auth page if user requests it or if trying to access protected features while not logged in
    if (activeFeature === 'auth') {
      return <AuthPage onSuccessfulAuth={handleSuccessfulAuth} />;
    }

    // If user is not logged in and trying to access protected features, show auth page
    if (!user && (activeFeature === 'daily' || activeFeature === 'weekly' || activeFeature === 'profile')) {
      return <AuthPage onSuccessfulAuth={handleSuccessfulAuth} />;
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
```
