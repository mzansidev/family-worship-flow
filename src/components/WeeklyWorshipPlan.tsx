import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Book, Target, Plus, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WorkshipPlan {
  id: string;
  study_type: 'book' | 'topic';
  book_name?: string;
  topic_name?: string;
  current_week: number;
  current_chapter?: number;
  start_date: string;
  end_date?: string;
}

export const WeeklyWorshipPlan = () => {
  const [currentPlan, setCurrentPlan] = useState<WorkshipPlan | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    study_type: 'book' as 'book' | 'topic',
    book_name: '',
    topic_name: '',
    duration_weeks: 4
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCurrentPlan = async () => {
    if (!user) return;

    try {
      const { data: plan, error } = await supabase
        .from('worship_plans')
        .select('*')
        .eq('user_id', user.id as any)
        .eq('is_active', true as any)
        .maybeSingle();

      if (error) {
        console.error('Error fetching plan:', error);
        setLoading(false);
        return;
      }

      if (plan && typeof plan === 'object' && 'study_type' in plan) {
        const planData = plan as any;
        setCurrentPlan({
          id: planData.id,
          study_type: planData.study_type,
          book_name: planData.book_name || '',
          topic_name: planData.topic_name || '',
          current_week: planData.current_week || 1,
          current_chapter: planData.current_chapter || 1,
          start_date: planData.start_date,
          end_date: planData.end_date
        });
        setCurrentWeek(planData.current_week || 1);
      }
    } catch (error) {
      console.error('Error in fetchCurrentPlan:', error);
    }
    
    setLoading(false);
  };

  const generateWeeklyContent = () => {
    if (!currentPlan) return null;

    const bibleBooks = {
      'Genesis': { chapters: 50, theme: 'Beginnings and God\'s Promises' },
      'Psalms': { chapters: 150, theme: 'Worship and Trust in God' },
      'Proverbs': { chapters: 31, theme: 'Wisdom for Daily Living' },
      'John': { chapters: 21, theme: 'Jesus, the Way to Life' },
      'Romans': { chapters: 16, theme: 'Salvation and Christian Living' }
    };

    if (currentPlan.study_type === 'book' && currentPlan.book_name) {
      const book = bibleBooks[currentPlan.book_name as keyof typeof bibleBooks];
      if (book) {
        const chaptersPerWeek = Math.ceil(book.chapters / 8); // Assume 8-week study
        const startChapter = (currentWeek - 1) * chaptersPerWeek + 1;
        const endChapter = Math.min(startChapter + chaptersPerWeek - 1, book.chapters);
        
        return {
          title: `${currentPlan.book_name} Study - Week ${currentWeek}`,
          reading: `${currentPlan.book_name} ${startChapter}${endChapter > startChapter ? `-${endChapter}` : ''}`,
          theme: book.theme,
          questions: [
            `What does this passage teach us about God's character?`,
            `How does this apply to our family relationships?`,
            `What is one practical way we can live out this teaching this week?`,
            `What questions does this passage raise for us to explore further?`
          ]
        };
      }
    } else if (currentPlan.study_type === 'topic' && currentPlan.topic_name) {
      const topics = {
        'Prayer': [
          'Matthew 6:9-13 - The Lord\'s Prayer',
          'Luke 18:1-8 - Persistent Prayer',
          '1 Thessalonians 5:16-18 - Pray Continually',
          'James 5:13-16 - Prayer for All Situations'
        ],
        'Faith': [
          'Hebrews 11:1-6 - Faith Defined',
          'Romans 10:17 - Faith Comes by Hearing',
          'James 2:14-26 - Faith and Works',
          'Matthew 17:20 - Faith Like a Mustard Seed'
        ]
      };

      const topicReadings = topics[currentPlan.topic_name as keyof typeof topics] || [];
      const reading = topicReadings[currentWeek - 1] || `Week ${currentWeek} reading`;

      return {
        title: `${currentPlan.topic_name} Study - Week ${currentWeek}`,
        reading: reading,
        theme: `Understanding ${currentPlan.topic_name}`,
        questions: [
          `How does this passage deepen our understanding of ${currentPlan.topic_name.toLowerCase()}?`,
          `What examples do we see in this text?`,
          `How can we apply this in our daily lives?`,
          `What will we do differently this week because of what we learned?`
        ]
      };
    }

    return null;
  };

  const handleCreatePlan = async () => {
    if (!user) return;

    const planData = {
      user_id: user.id,
      study_type: formData.study_type,
      book_name: formData.study_type === 'book' ? formData.book_name : null,
      topic_name: formData.study_type === 'topic' ? formData.topic_name : null,
      current_week: 1,
      current_chapter: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + formData.duration_weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
      plan_type: 'weekly'
    };

    try {
      // Deactivate existing plans
      await supabase
        .from('worship_plans')
        .update({ is_active: false } as any)
        .eq('user_id', user.id as any);

      // Create new plan
      const { data, error } = await supabase
        .from('worship_plans')
        .insert(planData as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "New weekly worship plan created!"
      });

      setShowCreateDialog(false);
      fetchCurrentPlan();
      
      // Reset form
      setFormData({
        study_type: 'book',
        book_name: '',
        topic_name: '',
        duration_weeks: 4
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create worship plan",
        variant: "destructive"
      });
    }
  };

  const handleAdvanceWeek = async () => {
    if (!currentPlan) return;

    const nextWeek = currentWeek + 1;
    
    try {
      await supabase
        .from('worship_plans')
        .update({ current_week: nextWeek } as any)
        .eq('id', currentPlan.id as any);

      setCurrentWeek(nextWeek);
      
      toast({
        title: "Week Advanced!",
        description: `Now on week ${nextWeek} of your study.`
      });
    } catch (error) {
      console.error('Error advancing week:', error);
      toast({
        title: "Error",
        description: "Failed to advance to next week",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchCurrentPlan();
    }
  }, [user]);

  if (loading) {
    return <div className="text-center p-8">Loading weekly worship plan...</div>;
  }

  if (!currentPlan) {
    return (
      <div className="text-center p-8 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">No Active Weekly Plan</h2>
        <p className="text-gray-600">Create a structured weekly worship plan for your family.</p>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Weekly Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Weekly Worship Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Study Type</Label>
                <Select 
                  value={formData.study_type} 
                  onValueChange={(value: 'book' | 'topic') => setFormData(prev => ({ ...prev, study_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Bible Book Study</SelectItem>
                    <SelectItem value="topic">Topical Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.study_type === 'book' && (
                <div className="space-y-2">
                  <Label>Bible Book</Label>
                  <Select 
                    value={formData.book_name} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, book_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a book" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Genesis">Genesis</SelectItem>
                      <SelectItem value="Psalms">Psalms</SelectItem>
                      <SelectItem value="Proverbs">Proverbs</SelectItem>
                      <SelectItem value="John">John</SelectItem>
                      <SelectItem value="Romans">Romans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.study_type === 'topic' && (
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Select 
                    value={formData.topic_name} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, topic_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prayer">Prayer</SelectItem>
                      <SelectItem value="Faith">Faith</SelectItem>
                      <SelectItem value="Love">Love</SelectItem>
                      <SelectItem value="Forgiveness">Forgiveness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Duration (weeks)</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) || 4 }))}
                />
              </div>

              <Button onClick={handleCreatePlan} className="w-full">
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const weeklyContent = generateWeeklyContent();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Weekly Worship Plan
              </h2>
              <p className="text-blue-100">
                {currentPlan.study_type === 'book' ? currentPlan.book_name : currentPlan.topic_name} Study
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">Week {currentWeek}</div>
              <div className="text-blue-100 text-sm">Current Progress</div>
            </div>
          </div>
        </div>
      </Card>

      {weeklyContent && (
        <div className="space-y-4">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Book className="w-5 h-5 mr-2 text-gray-600" />
                This Week's Reading
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-blue-700">{weeklyContent.reading}</p>
                <p className="text-gray-600 text-sm italic">{weeklyContent.theme}</p>
              </div>
            </div>
          </Card>

          <Card className="border-2 border-orange-200 bg-orange-50">
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
                Discussion Questions
              </h3>
              <ol className="space-y-2">
                {weeklyContent.questions.map((question, index) => (
                  <li key={index} className="flex">
                    <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{question}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2 text-gray-600" />
                This Week's Challenge
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Choose one key insight from this week's reading and find a practical way to apply it in your family life. 
                Share your experiences during next week's worship time.
              </p>
            </div>
          </Card>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          onClick={handleAdvanceWeek}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Next Week
        </Button>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Weekly Worship Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Study Type</Label>
                <Select 
                  value={formData.study_type} 
                  onValueChange={(value: 'book' | 'topic') => setFormData(prev => ({ ...prev, study_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Bible Book Study</SelectItem>
                    <SelectItem value="topic">Topical Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.study_type === 'book' && (
                <div className="space-y-2">
                  <Label>Bible Book</Label>
                  <Select 
                    value={formData.book_name} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, book_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a book" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Genesis">Genesis</SelectItem>
                      <SelectItem value="Psalms">Psalms</SelectItem>
                      <SelectItem value="Proverbs">Proverbs</SelectItem>
                      <SelectItem value="John">John</SelectItem>
                      <SelectItem value="Romans">Romans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.study_type === 'topic' && (
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Select 
                    value={formData.topic_name} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, topic_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prayer">Prayer</SelectItem>
                      <SelectItem value="Faith">Faith</SelectItem>
                      <SelectItem value="Love">Love</SelectItem>
                      <SelectItem value="Forgiveness">Forgiveness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Duration (weeks)</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) || 4 }))}
                />
              </div>

              <Button onClick={handleCreatePlan} className="w-full">
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
