
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
        .eq('user_id' as any, user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReflections((data as Reflection[]) || []);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReflection = async (reflection: Omit<Reflection, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_reflections')
        .insert({
          user_id: user.id,
          ...reflection
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
        .eq('id' as any, id);

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
        .eq('id' as any, id);

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
