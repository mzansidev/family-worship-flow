
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Reflection {
  id: string;
  reflection_text: string;
  bible_verse?: string;
  worship_date: string;
  created_at: string;
  daily_entry_id?: string;
  daily_worship_entries?: {
    bible_reading?: string;
    theme?: string;
  };
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
        .select(`
          *,
          daily_worship_entries (
            bible_reading,
            theme
          )
        `)
        .eq('user_id', user.id)
        .order('worship_date', { ascending: false });

      if (error) throw error;
      setReflections(data || []);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReflection = async (reflectionText: string, worshipDate: string, bibleVerse?: string, dailyEntryId?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_reflections')
        .insert([{
          user_id: user.id,
          reflection_text: reflectionText,
          worship_date: worshipDate,
          bible_verse: bibleVerse,
          daily_entry_id: dailyEntryId
        }])
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
        .update(updates)
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
