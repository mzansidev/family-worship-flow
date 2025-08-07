
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PrincipleContent {
  id: string;
  title: string;
  content: string;
  category_id: string;
  read_time: string;
  is_new: boolean;
  created_at: string;
  updated_at: string;
}

export const usePrinciplesContent = () => {
  const [principles, setPrinciples] = useState<PrincipleContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPrinciples = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('principles_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching principles:', fetchError);
        setError('Failed to load principles');
        return;
      }

      if (data) {
        setPrinciples(data as PrincipleContent[]);
      }
    } catch (error) {
      console.error('Error in fetchPrinciples:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addPrinciple = async (principle: Omit<PrincipleContent, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('principles_content')
        .insert(principle as any)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPrinciples(prev => [data as PrincipleContent, ...prev]);
      }

      return data;
    } catch (error) {
      console.error('Error adding principle:', error);
      setError('Failed to add principle');
      return null;
    }
  };

  const updatePrinciple = async (id: string, updates: Partial<PrincipleContent>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('principles_content')
        .update(updates as any)
        .eq('id', id as any)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPrinciples(prev =>
          prev.map(principle =>
            principle.id === id ? { ...principle, ...data } : principle
          )
        );
      }

      return data;
    } catch (error) {
      console.error('Error updating principle:', error);
      setError('Failed to update principle');
      return null;
    }
  };

  const deletePrinciple = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('principles_content')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      setPrinciples(prev => prev.filter(principle => principle.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting principle:', error);
      setError('Failed to delete principle');
      return false;
    }
  };

  useEffect(() => {
    fetchPrinciples();
  }, []);

  return {
    principles,
    loading,
    error,
    addPrinciple,
    updatePrinciple,
    deletePrinciple,
    refetch: fetchPrinciples,
  };
};
