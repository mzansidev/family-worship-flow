
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePrincipleReads = () => {
  const [readPrinciples, setReadPrinciples] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReadPrinciples();
    }
  }, [user]);

  const fetchReadPrinciples = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_principle_reads')
        .select('principle_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const readIds = new Set(data?.map(item => item.principle_id) || []);
      setReadPrinciples(readIds);
    } catch (error) {
      console.error('Error fetching read principles:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (principleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_principle_reads')
        .upsert([{
          user_id: user.id,
          principle_id: principleId
        }]);

      if (error) throw error;
      
      setReadPrinciples(prev => new Set([...prev, principleId]));
    } catch (error) {
      console.error('Error marking principle as read:', error);
      throw error;
    }
  };

  const getUnreadCount = (principleIds: string[]) => {
    return principleIds.filter(id => !readPrinciples.has(id)).length;
  };

  return {
    readPrinciples,
    loading,
    markAsRead,
    getUnreadCount,
    refetch: fetchReadPrinciples
  };
};
