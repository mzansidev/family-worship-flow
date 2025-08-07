
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  family_name?: string;
  role: "admin" | "user";
  created_at: string;
  password_hash?: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id as any)
        .single();

      if (error) throw error;
      setProfile(data as unknown as UserProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates as any)
        .eq('id', user.id as any)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state immediately
      setProfile(prevProfile => prevProfile ? { ...prevProfile, ...(data as unknown as UserProfile) } : (data as unknown as UserProfile));
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    changePassword,
    refetch: fetchProfile
  };
};
