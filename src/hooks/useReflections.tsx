
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Reflection {
  id: string;
  content: string;
  date: string;
  user_id: string;
  created_at: string;
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
      
      const mappedReflections: Reflection[] = (data || []).map(item => ({
        id: item.id,
        content: item.content || '',
        date: item.date || '',
        user_id: item.user_id || '',
        created_at: item.created_at || ''
      }));
      
      setReflections(mappedReflections);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReflection = async (content: string, date: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_reflections')
        .insert({ 
          user_id: user.id, 
          content, 
          date 
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
