import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PlanHistoryItem {
  id: string;
  user_id: string;
  plan_name: string;
  study_type: string;
  plan_type: string;
  book_name?: string;
  topic_name?: string;
  current_week: number;
  current_chapter: number;
  start_date: string;
  progress_data?: any;
  total_days_completed: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export const usePlanHistory = () => {
  const [history, setHistory] = useState<PlanHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plan_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching plan history:', error);
        return;
      }

      setHistory(data || []);
    } catch (error) {
      console.error('Error in fetchHistory:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePlanToHistory = async (
    currentPlan: any,
    planName: string,
    completedDays: number = 0
  ) => {
    if (!user?.id || !currentPlan) return;

    try {
      const historyData = {
        user_id: user.id,
        plan_name: planName,
        study_type: currentPlan.study_type,
        plan_type: currentPlan.plan_type || 'weekly',
        book_name: currentPlan.book_name,
        topic_name: currentPlan.topic_name,
        current_week: currentPlan.current_week,
        current_chapter: currentPlan.current_chapter,
        start_date: currentPlan.start_date,
        total_days_completed: completedDays,
        progress_data: {
          original_plan_id: currentPlan.id,
          saved_at: new Date().toISOString(),
          week_progress: currentPlan.current_week,
          chapter_progress: currentPlan.current_chapter
        }
      };

      const { data, error } = await supabase
        .from('plan_history')
        .insert(historyData)
        .select()
        .single();

      if (error) {
        console.error('Error saving plan to history:', error);
        throw error;
      }

      setHistory(prev => [data, ...prev]);
      
      toast({
        title: "Plan Saved",
        description: `"${planName}" has been saved to your plan history.`
      });

      return data;
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: `Failed to save plan: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const restorePlanFromHistory = async (historyItem: PlanHistoryItem) => {
    if (!user?.id) return null;

    try {
      // First, deactivate current active plans
      await supabase
        .from('worship_plans')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('plan_type', 'weekly');

      // Create new active plan from history
      const restoredPlan = {
        user_id: user.id,
        study_type: historyItem.study_type,
        plan_type: historyItem.plan_type,
        book_name: historyItem.book_name,
        topic_name: historyItem.topic_name,
        current_week: historyItem.current_week,
        current_chapter: historyItem.current_chapter,
        start_date: historyItem.start_date,
        is_active: true
      };

      const { data, error } = await supabase
        .from('worship_plans')
        .insert(restoredPlan)
        .select()
        .single();

      if (error) {
        console.error('Error restoring plan:', error);
        throw error;
      }

      toast({
        title: "Plan Restored",
        description: `"${historyItem.plan_name}" has been restored and is now your active plan.`
      });

      return data;
    } catch (error: any) {
      console.error('Error restoring plan:', error);
      toast({
        title: "Error",
        description: `Failed to restore plan: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  };

  const deletePlanFromHistory = async (historyId: string) => {
    try {
      const { error } = await supabase
        .from('plan_history')
        .delete()
        .eq('id', historyId);

      if (error) {
        console.error('Error deleting plan from history:', error);
        throw error;
      }

      setHistory(prev => prev.filter(item => item.id !== historyId));
      
      toast({
        title: "Plan Deleted",
        description: "Plan has been removed from your history."
      });
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: `Failed to delete plan: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const archivePlanInHistory = async (historyId: string) => {
    try {
      const { error } = await supabase
        .from('plan_history')
        .update({ is_archived: true })
        .eq('id', historyId);

      if (error) {
        console.error('Error archiving plan:', error);
        throw error;
      }

      setHistory(prev => prev.filter(item => item.id !== historyId));
      
      toast({
        title: "Plan Archived",
        description: "Plan has been archived."
      });
    } catch (error: any) {
      console.error('Error archiving plan:', error);
      toast({
        title: "Error",
        description: `Failed to archive plan: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  return {
    history,
    loading,
    savePlanToHistory,
    restorePlanFromHistory,
    deletePlanFromHistory,
    archivePlanInHistory,
    refetch: fetchHistory
  };
};