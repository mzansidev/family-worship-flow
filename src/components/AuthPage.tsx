
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
