
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Music, Book, MessageCircle, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DailyPlanEditorProps {
  date: string;
  onBack: () => void;
  initialData?: any;
}

export const DailyPlanEditor: React.FC<DailyPlanEditorProps> = ({ date, onBack, initialData }) => {
  const [planData, setPlanData] = useState({
    openingSong: '',
    bibleReading: '',
    theme: '',
    discussionQuestions: ['', '', '', ''],
    application: '',
    closingSong: '',
    reflectionNotes: '',
    familyMembers: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setPlanData({
        openingSong: initialData.opening_song || '',
        bibleReading: initialData.bible_reading || '',
        theme: initialData.theme || '',
        discussionQuestions: Array.isArray(initialData.discussion_questions) 
          ? initialData.discussion_questions.slice(0, 4)
          : ['', '', '', ''],
        application: initialData.application || '',
        closingSong: initialData.closing_song || '',
        reflectionNotes: initialData.reflection_notes || '',
        familyMembers: initialData.family_members_present?.join(', ') || ''
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const dataToSave = {
        user_id: user.id,
        date,
        opening_song: planData.openingSong,
        bible_reading: planData.bibleReading,
        theme: planData.theme,
        discussion_questions: planData.discussionQuestions.filter(q => q.trim() !== ''),
        application: planData.application,
        closing_song: planData.closingSong,
        reflection_notes: planData.reflectionNotes,
        family_members_present: planData.familyMembers.split(',').map(m => m.trim()).filter(m => m !== '')
      };

      const { error } = await supabase
        .from('daily_worship_entries')
        .upsert([dataToSave], { onConflict: 'user_id,date' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Daily plan saved successfully!"
      });
      
      onBack();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "Failed to save plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDiscussionQuestion = (index: number, value: string) => {
    const newQuestions = [...planData.discussionQuestions];
    newQuestions[index] = value;
    setPlanData({ ...planData, discussionQuestions: newQuestions });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Book className="w-6 h-6 mr-2" />
                Edit Daily Plan
              </h2>
              <p className="text-purple-100">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Music className="w-5 h-5 mr-2 text-blue-600" />
              Opening Song
            </h3>
            <Input
              value={planData.openingSong}
              onChange={(e) => setPlanData({ ...planData, openingSong: e.target.value })}
              placeholder="e.g., Be Thou My Vision (SDAH #547)"
            />
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Music className="w-5 h-5 mr-2 text-blue-600" />
              Closing Song
            </h3>
            <Input
              value={planData.closingSong}
              onChange={(e) => setPlanData({ ...planData, closingSong: e.target.value })}
              placeholder="e.g., How Great Thou Art (SDAH #86)"
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Book className="w-5 h-5 mr-2 text-purple-600" />
              Bible Reading
            </h3>
            <Input
              value={planData.bibleReading}
              onChange={(e) => setPlanData({ ...planData, bibleReading: e.target.value })}
              placeholder="e.g., Psalm 23:1-6 - The Lord is My Shepherd"
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Theme</h3>
            <Input
              value={planData.theme}
              onChange={(e) => setPlanData({ ...planData, theme: e.target.value })}
              placeholder="e.g., God's Love for Us"
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-orange-600" />
              Discussion Questions
            </h3>
            <div className="space-y-3">
              {planData.discussionQuestions.map((question, index) => (
                <div key={index}>
                  <Label htmlFor={`question-${index}`} className="text-sm text-gray-600">
                    Question {index + 1}
                  </Label>
                  <Input
                    id={`question-${index}`}
                    value={question}
                    onChange={(e) => updateDiscussionQuestion(index, e.target.value)}
                    placeholder={`Enter discussion question ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Practical Application
            </h3>
            <Textarea
              value={planData.application}
              onChange={(e) => setPlanData({ ...planData, application: e.target.value })}
              placeholder="How can the family apply today's lesson in their daily lives?"
              rows={3}
            />
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Family Members Present</h3>
            <Input
              value={planData.familyMembers}
              onChange={(e) => setPlanData({ ...planData, familyMembers: e.target.value })}
              placeholder="e.g., John, Mary, Sarah"
            />
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Reflection Notes</h3>
            <Textarea
              value={planData.reflectionNotes}
              onChange={(e) => setPlanData({ ...planData, reflectionNotes: e.target.value })}
              placeholder="Any additional thoughts or reflections..."
              rows={3}
            />
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Plan'}
        </Button>
      </div>
    </div>
  );
};
