
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PrincipleContent {
  id: string;
  category_id: string;
  title: string;
  content: string;
  read_time: string;
  is_new: boolean;
  created_at: string;
}

export const usePrinciplesContent = () => {
  const [principlesContent, setPrinciplesContent] = useState<PrincipleContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrinciplesContent();
  }, []);

  const fetchPrinciplesContent = async () => {
    try {
      const { data, error } = await supabase
        .from('principles_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrinciplesContent((data as unknown as PrincipleContent[]) || []);
    } catch (error) {
      console.error('Error fetching principles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePrinciple = async (id: string) => {
    try {
      const { error } = await supabase
        .from('principles_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPrinciplesContent();
    } catch (error) {
      console.error('Error deleting principle:', error);
      throw error;
    }
  };

  const updatePrinciple = async (id: string, updates: Partial<PrincipleContent>) => {
    try {
      const { error } = await supabase
        .from('principles_content')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchPrinciplesContent();
    } catch (error) {
      console.error('Error updating principle:', error);
      throw error;
    }
  };

  return {
    principlesContent,
    loading,
    deletePrinciple,
    updatePrinciple,
    refetch: fetchPrinciplesContent
  };
};
