
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

type StudyType = 'book' | 'topic' | 'custom';
type PlanType = 'weekly' | 'monthly' | 'quarterly';

const WeeklyWorshipPlan = () => {
  const [studyType, setStudyType] = useState<StudyType>('book');
  const [planType, setPlanType] = useState<PlanType>('weekly');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const bibleBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'
  ];

  const topicStudies = [
    'Prayer and Faith', 'Love and Relationships', 'Wisdom and Decision Making',
    'Forgiveness and Grace', 'Service and Ministry', 'Hope and Perseverance',
    'Stewardship and Giving', 'Family Values', 'Character Development',
    'Spiritual Warfare', 'The Fruit of the Spirit', 'End Times'
  ];

  const loadCurrentPlan = async () => {
    if (!user) return;

    try {
      const { data: plan, error } = await supabase
        .from('worship_plans')
        .select('*')
        .eq('user_id', user.id as any)
        .eq('is_active', true as any)
        .maybeSingle();

      if (error) {
        console.error('Error loading plan:', error);
        return;
      }

      if (plan) {
        setCurrentPlan(plan);
        setStudyType(plan.study_type as StudyType);
        if (plan.study_type === 'book') {
          setSelectedBook(plan.book_name || '');
        } else if (plan.study_type === 'topic') {
          setSelectedTopic(plan.topic_name || '');
        }
        setCurrentWeek(plan.current_week || 1);
      }
    } catch (error) {
      console.error('Error in loadCurrentPlan:', error);
    }
  };

  const generateWeeklyContent = () => {
    if (studyType === 'book' && selectedBook) {
      return generateBookStudy(selectedBook, currentWeek);
    } else if (studyType === 'topic' && selectedTopic) {
      return generateTopicStudy(selectedTopic, currentWeek);
    }
    return null;
  };

  const generateBookStudy = (book: string, week: number) => {
    const bookContent = {
      'Genesis': [
        { week: 1, chapter: '1-3', theme: 'Creation and Fall', verses: 'Genesis 1:31, 3:15' },
        { week: 2, chapter: '6-9', theme: 'Noah and the Flood', verses: 'Genesis 8:20-21' },
        { week: 3, chapter: '12', theme: 'Abraham\'s Call', verses: 'Genesis 12:1-3' }
      ],
      'Psalms': [
        { week: 1, chapter: '1', theme: 'The Blessed Life', verses: 'Psalm 1:1-3' },
        { week: 2, chapter: '23', theme: 'The Lord is My Shepherd', verses: 'Psalm 23:1-6' },
        { week: 3, chapter: '91', theme: 'God\'s Protection', verses: 'Psalm 91:1-2' }
      ],
      'Matthew': [
        { week: 1, chapter: '5-7', theme: 'The Sermon on the Mount', verses: 'Matthew 5:16' },
        { week: 2, chapter: '14', theme: 'Jesus Walks on Water', verses: 'Matthew 14:29-31' },
        { week: 3, chapter: '28', theme: 'The Great Commission', verses: 'Matthew 28:19-20' }
      ]
    };

    const content = bookContent[book as keyof typeof bookContent] || bookContent['Genesis'];
    const currentContent = content[week - 1] || content[0];

    return {
      title: `${book} Study - Week ${week}`,
      reading: `${book} ${currentContent.chapter}`,
      theme: currentContent.theme,
      keyVerse: currentContent.verses,
      discussion: [
        `What does this passage teach us about ${currentContent.theme.toLowerCase()}?`,
        'How can we apply this lesson to our daily lives?',
        'What questions do you have about this passage?'
      ]
    };
  };

  const generateTopicStudy = (topic: string, week: number) => {
    const topicContent = {
      'Prayer and Faith': [
        { theme: 'The Power of Prayer', verses: 'Matthew 21:22', reading: 'Matthew 6:5-15' },
        { theme: 'Faith in Action', verses: 'James 2:26', reading: 'Hebrews 11:1-16' },
        { theme: 'Trusting God', verses: 'Proverbs 3:5-6', reading: 'Psalm 37:3-7' }
      ],
      'Love and Relationships': [
        { theme: 'God\'s Love for Us', verses: '1 John 4:19', reading: 'Romans 8:31-39' },
        { theme: 'Loving Others', verses: 'John 13:34-35', reading: '1 Corinthians 13' },
        { theme: 'Family Love', verses: 'Ephesians 6:1-4', reading: 'Colossians 3:12-21' }
      ]
    };

    const content = topicContent[topic as keyof typeof topicContent] || topicContent['Prayer and Faith'];
    const currentContent = content[week - 1] || content[0];

    return {
      title: `${topic} Study - Week ${week}`,
      reading: currentContent.reading,
      theme: currentContent.theme,
      keyVerse: currentContent.verses,
      discussion: [
        `How does this passage help us understand ${currentContent.theme.toLowerCase()}?`,
        'What practical steps can we take to apply this teaching?',
        'How can our family grow in this area together?'
      ]
    };
  };

  const createNewPlan = async () => {
    if (!user) return;

    const planData = {
      user_id: user.id,
      study_type: studyType,
      plan_type: planType,
      book_name: studyType === 'book' ? selectedBook : null,
      topic_name: studyType === 'topic' ? selectedTopic : null,
      current_week: 1,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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

      setCurrentPlan(data);
      setCurrentWeek(1);
      setShowCreateDialog(false);
      
      toast({
        title: "Plan Created!",
        description: "Your new weekly worship plan has been created."
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive"
      });
    }
  };

  const advanceToNextWeek = async () => {
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
        description: `Moved to week ${nextWeek} of your study.`
      });
    } catch (error) {
      console.error('Error advancing week:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadCurrentPlan();
    }
  }, [user]);

  const weeklyContent = generateWeeklyContent();

  if (!currentPlan) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Weekly Worship Plan</h2>
          <p className="text-gray-600 mb-6">Create a structured worship plan to guide your family through Bible study.</p>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Weekly Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Worship Plan</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="study-type">Study Type</Label>
                  <Select value={studyType} onValueChange={(value: StudyType) => setStudyType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Bible Book Study</SelectItem>
                      <SelectItem value="topic">Topic Study</SelectItem>
                      <SelectItem value="custom">Custom Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {studyType === 'book' && (
                  <div>
                    <Label htmlFor="book">Select Bible Book</Label>
                    <Select value={selectedBook} onValueChange={setSelectedBook}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a book..." />
                      </SelectTrigger>
                      <SelectContent>
                        {bibleBooks.map(book => (
                          <SelectItem key={book} value={book}>{book}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {studyType === 'topic' && (
                  <div>
                    <Label htmlFor="topic">Select Topic</Label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a topic..." />
                      </SelectTrigger>
                      <SelectContent>
                        {topicStudies.map(topic => (
                          <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="plan-type">Plan Duration</Label>
                  <Select value={planType} onValueChange={(value: PlanType) => setPlanType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly (7 weeks)</SelectItem>
                      <SelectItem value="monthly">Monthly (4 weeks)</SelectItem>
                      <SelectItem value="quarterly">Quarterly (12 weeks)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={createNewPlan} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={!selectedBook && !selectedTopic && studyType !== 'custom'}
                >
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
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
              <div className="text-sm text-blue-100">Current Week</div>
              <div className="text-3xl font-bold">{currentWeek}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Week Content */}
      {weeklyContent && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <Book className="w-5 h-5 mr-2 text-blue-500" />
                {weeklyContent.title}
              </h3>
              <Button 
                onClick={advanceToNextWeek}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Next Week
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Book className="w-4 h-4 mr-2" />
                    Bible Reading
                  </h4>
                  <p className="text-blue-700">{weeklyContent.reading}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Theme
                  </h4>
                  <p className="text-purple-700">{weeklyContent.theme}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Key Verse</h4>
                  <p className="text-green-700 italic">"{weeklyContent.keyVerse}"</p>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Discussion Questions
                </h4>
                <ol className="space-y-2">
                  {weeklyContent.discussion.map((question, index) => (
                    <li key={index} className="flex">
                      <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-orange-700">{question}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Plan Management */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Plan Settings
          </h3>
          
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Worship Plan</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="study-type">Study Type</Label>
                    <Select value={studyType} onValueChange={(value: StudyType) => setStudyType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="book">Bible Book Study</SelectItem>
                        <SelectItem value="topic">Topic Study</SelectItem>
                        <SelectItem value="custom">Custom Plan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {studyType === 'book' && (
                    <div>
                      <Label htmlFor="book">Select Bible Book</Label>
                      <Select value={selectedBook} onValueChange={setSelectedBook}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a book..." />
                        </SelectTrigger>
                        <SelectContent>
                          {bibleBooks.map(book => (
                            <SelectItem key={book} value={book}>{book}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {studyType === 'topic' && (
                    <div>
                      <Label htmlFor="topic">Select Topic</Label>
                      <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a topic..." />
                        </SelectTrigger>
                        <SelectContent>
                          {topicStudies.map(topic => (
                            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button 
                    onClick={createNewPlan} 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={!selectedBook && !selectedTopic && studyType !== 'custom'}
                  >
                    Create Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>
    </div>
  );
};

export { WeeklyWorshipPlan };
