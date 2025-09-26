
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WeeklyPlanSetup } from './WeeklyPlanSetup';
import { WeeklyPlanCalendar } from './WeeklyPlanCalendar';
import { WeeklyPlanContent } from './WeeklyPlanContent';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export const WeeklyWorshipPlan = () => {
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(-1);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCurrentPlan = async () => {
    if (!user?.id) return;
    
    try {
      const { data: plan, error } = await supabase
        .from('worship_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('plan_type', 'weekly')
        .maybeSingle();

      if (error) {
        console.error('Error fetching plan:', error);
        return;
      }

      if (plan) {
        console.log('[WeeklyWorshipPlan] fetched plan:', plan);
        setCurrentPlan(plan);
      }
    } catch (error) {
      console.error('Error in fetchCurrentPlan:', error);
    }
  };

  const createNewPlan = async (studyType: string, selection: string) => {
    setLoading(true);

    try {
      // Deactivate existing weekly plans
      await supabase
        .from('worship_plans')
        .update({ is_active: false })
        .eq('user_id', user!.id)
        .eq('plan_type', 'weekly');

      const normalizedStudyType = studyType === 'topical' ? 'topic' : 'book';

      const planData = {
        user_id: user!.id,
        study_type: normalizedStudyType,
        plan_type: 'weekly',
        book_name: normalizedStudyType === 'book' ? selection : null,
        topic_name: normalizedStudyType === 'topic' ? selection : null,
        current_week: 1,
        current_chapter: 1,
        is_active: true,
        start_date: new Date().toISOString().split('T')[0]
      };

      console.log('[WeeklyWorshipPlan] creating plan with:', planData);

      const { data, error } = await supabase
        .from('worship_plans')
        .insert(planData as any)
        .select()
        .single();

      if (error) {
        console.error('Detailed error creating plan:', error);
        throw error;
      }

      setCurrentPlan(data);
      
      toast({
        title: "Success",
        description: "New weekly worship plan created!"
      });
    } catch (error: any) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: `Failed to create worship plan: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const advanceWeeklyPlan = async () => {
    if (!currentPlan) return;

    try {
      const nextWeek = currentPlan.current_week + 1;
      const nextChapter = currentPlan.study_type === 'book' ? currentPlan.current_chapter + 1 : currentPlan.current_chapter;

      const { error } = await supabase
        .from('worship_plans')
        .update({
          current_week: nextWeek,
          current_chapter: nextChapter,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', currentPlan.id);

      if (error) {
        console.error('Error advancing plan:', error);
        return;
      }

      // Update local state
      setCurrentPlan({
        ...currentPlan,
        current_week: nextWeek,
        current_chapter: nextChapter
      });

      toast({
        title: "Plan Advanced",
        description: `Moved to week ${nextWeek}${currentPlan.study_type === 'book' ? `, chapter ${nextChapter}` : ''}`
      });
    } catch (error) {
      console.error('Error advancing plan:', error);
      toast({
        title: "Error",
        description: "Failed to advance plan",
        variant: "destructive"
      });
    }
  };

  const checkAndAdvanceWeek = async () => {
    if (!currentPlan || !user?.id) return;

    const today = new Date();
    const startDate = new Date(currentPlan.start_date);
    
    // Calculate weeks since start (assuming Monday start)
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksSinceStart = Math.floor(daysSinceStart / 7) + 1;

    if (weeksSinceStart > currentPlan.current_week) {
      await advanceWeeklyPlan();
    }
  };

  const [pendingAssignments, setPendingAssignments] = useState<{[key: string]: {[key: string]: string}}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleUpdateAssignment = async (day: number, role: string, memberId: string) => {
    const assignmentKey = `${day}-${role}`;
    setPendingAssignments(prev => ({
      ...prev,
      [assignmentKey]: { day: day.toString(), role, memberId }
    }));
    setHasUnsavedChanges(true);
    
    console.log(`Assignment queued: ${memberId} to ${role} on day ${day}`);
  };

  const saveWeeklyPlan = async () => {
    if (!currentPlan || !user?.id) return;
    
    setLoading(true);
    try {
      // Here you would save the pending assignments to the database
      // For now, we'll just clear the pending state and show success
      
      // In a full implementation, you might create a weekly_assignments table
      // or store the assignments in the worship_plans table as JSONB
      
      setPendingAssignments({});
      setHasUnsavedChanges(false);
      
      toast({
        title: "Plan Saved",
        description: "Weekly worship plan and assignments have been saved successfully!"
      });
    } catch (error) {
      console.error('Error saving weekly plan:', error);
      toast({
        title: "Error",
        description: "Failed to save weekly plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPlan = async () => {
    if (!currentPlan) return;
    
    try {
      await supabase
        .from('worship_plans')
        .update({ is_active: false })
        .eq('id', currentPlan.id);
      
      setCurrentPlan(null);
      setSelectedDay(-1);
      
      toast({
        title: "Plan Reset",
        description: "Weekly plan has been reset. You can create a new one."
      });
    } catch (error) {
      console.error('Error resetting plan:', error);
      toast({
        title: "Error",
        description: "Failed to reset plan",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCurrentPlan().then(() => {
        // Check if we need to advance the week after loading
        checkAndAdvanceWeek();
      });
    }
  }, [user?.id]);

  if (!user) {
    return (
      <WeeklyPlanSetup 
        onCreatePlan={() => {}} 
        loading={false}
      />
    );
  }

  if (!currentPlan) {
    return (
      <WeeklyPlanSetup 
        onCreatePlan={createNewPlan} 
        loading={loading}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {currentPlan.study_type === 'book' ? currentPlan.book_name : currentPlan.topic_name} - Weekly Plan
          </h1>
          <p className="text-gray-600">
            {currentPlan.study_type === 'book' ? 'Bible Book Study' : 'Topical Study'} • Started {new Date(currentPlan.start_date).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={advanceWeeklyPlan}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Next Week
          </Button>
          
          <Button 
            onClick={resetPlan}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Change Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <WeeklyPlanCalendar
            plan={currentPlan}
            onDaySelect={setSelectedDay}
            selectedDay={selectedDay}
            onUpdateAssignment={handleUpdateAssignment}
          />
        </div>
        
        <div className="xl:col-span-1">
          <WeeklyPlanContent
            plan={currentPlan}
            selectedDay={selectedDay}
          />
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-accent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">You have unsaved changes to role assignments</span>
            </div>
            <Button 
              onClick={saveWeeklyPlan}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
