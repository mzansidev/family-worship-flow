
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Reflection {
  id: string;
  user_id: string;
  reflection_text: string;
  bible_verse?: string;
  worship_date: string;
  daily_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export const useReflections = () => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReflections();
    }
  }, [user]);

  const fetchReflections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('worship_date', { ascending: false });

      if (error) throw error;
      setReflections((data as Reflection[]) || []);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReflection = async (reflection_text: string, worship_date: string, bible_verse?: string, daily_entry_id?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_reflections')
        .insert({
          user_id: user.id,
          reflection_text,
          bible_verse,
          worship_date,
          daily_entry_id
        } as any)
        .select()
        .single();

      if (error) throw error;
      await fetchReflections();
      return data;
    } catch (error) {
      console.error('Error adding reflection:', error);
      throw error;
    }
  };

  const updateReflection = async (id: string, updates: Partial<Reflection>) => {
    try {
      const { error } = await supabase
        .from('user_reflections')
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;
      await fetchReflections();
    } catch (error) {
      console.error('Error updating reflection:', error);
      throw error;
    }
  };

  const deleteReflection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_reflections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchReflections();
    } catch (error) {
      console.error('Error deleting reflection:', error);
      throw error;
    }
  };

  return {
    reflections,
    loading,
    addReflection,
    updateReflection,
    deleteReflection,
    refetch: fetchReflections
  };
};
