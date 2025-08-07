import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Music, Book, MessageCircle, Target, Plus, X, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { ReflectionSection } from './ReflectionSection';

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
    familyMembers: '',
    leaderId: '',
    assistantId: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { members } = useFamilyMembers();

  useEffect(() => {
    if (initialData) {
      const questions = Array.isArray(initialData.discussion_questions) 
        ? initialData.discussion_questions
        : ['', '', '', ''];
      
      // Ensure we have at least 4 slots, pad with empty strings if needed
      while (questions.length < 4) {
        questions.push('');
      }

      setPlanData({
        openingSong: initialData.opening_song || '',
        bibleReading: initialData.bible_reading || '',
        theme: initialData.theme || '',
        discussionQuestions: questions,
        application: initialData.application || '',
        closingSong: initialData.closing_song || '',
        reflectionNotes: initialData.reflection_notes || '',
        familyMembers: initialData.family_members_present?.join(', ') || '',
        leaderId: initialData.leader_id || '',
        assistantId: initialData.assistant_id || ''
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('daily_worship_entries')
        .upsert({
          user_id: user.id,
          date: date,
          opening_song: planData.openingSong,
          bible_reading: planData.bibleReading,
          theme: planData.theme,
          discussion_questions: planData.discussionQuestions.filter(q => q.trim() !== ''),
          application: planData.application,
          closing_song: planData.closingSong,
          reflection_notes: planData.reflectionNotes,
          family_members_present: planData.familyMembers.split(',').map(m => m.trim()).filter(m => m !== ''),
          leader_id: planData.leaderId || null,
          assistant_id: planData.assistantId || null
        } as any, { 
          onConflict: 'user_id,date' 
        });

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

  const addDiscussionQuestion = () => {
    setPlanData({
      ...planData,
      discussionQuestions: [...planData.discussionQuestions, '']
    });
  };

  const removeDiscussionQuestion = (index: number) => {
    if (planData.discussionQuestions.length <= 3) return; // Keep at least 3 questions
    
    const newQuestions = planData.discussionQuestions.filter((_, i) => i !== index);
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
        {/* Family Responsibilities */}
        {members.length > 0 && (
          <Card className="lg:col-span-2">
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Family Responsibilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leader">Leader</Label>
                  <Select value={planData.leaderId} onValueChange={(value) => setPlanData({ ...planData, leaderId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leader" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No leader assigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assistant">Assistant</Label>
                  <Select value={planData.assistantId} onValueChange={(value) => setPlanData({ ...planData, assistantId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assistant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No assistant assigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        )}

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
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-orange-600" />
                Discussion Questions
              </h3>
              <Button
                onClick={addDiscussionQuestion}
                size="sm"
                variant="outline"
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </Button>
            </div>
            <div className="space-y-3">
              {planData.discussionQuestions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
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
                  {planData.discussionQuestions.length > 3 && (
                    <Button
                      onClick={() => removeDiscussionQuestion(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can add as many discussion questions as needed. The first 3 are typically generated automatically for book studies.
            </p>
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

      {/* Reflection Section */}
      <ReflectionSection 
        date={date} 
        dailyEntryId={initialData?.id}
        bibleReading={planData.bibleReading}
      />

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
