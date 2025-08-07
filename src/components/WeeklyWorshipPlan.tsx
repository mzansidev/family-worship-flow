import React, { useState, useEffect } from 'react';
import { Calendar, Book, Heart, Clock, Play, Pause, CheckCircle, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke',
  'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const TOPICAL_THEMES = [
  'Prayer and Faith', 'God\'s Love and Grace', 'Christian Character', 'Family Values',
  'Stewardship', 'Second Coming', 'Health and Wellness', 'Service and Mission'
];

export const WeeklyWorshipPlan = () => {
  const [studyType, setStudyType] = useState('bible-book');
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [selectedTopic, setSelectedTopic] = useState('Prayer and Faith');
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Weekly Worship Plan
            </h2>
            <p className="text-purple-100">Create structured weekly worship experiences</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Sign In Required</h3>
            <p className="text-gray-600 mb-4">
              Please sign in to create and manage your weekly worship plans.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const fetchCurrentPlan = async () => {
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
        setCurrentPlan(plan);
        setStudyType(plan.study_type || 'bible-book');
        if (plan.study_type === 'bible-book') {
          setSelectedBook(plan.book_name || 'Genesis');
        } else if (plan.study_type === 'topical') {
          setSelectedTopic(plan.topic_name || 'Prayer and Faith');
        }
      }
    } catch (error) {
      console.error('Error in fetchCurrentPlan:', error);
    }
  };

  const createNewPlan = async () => {
    setLoading(true);

    try {
      // Deactivate existing weekly plans
      await supabase
        .from('worship_plans')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('plan_type', 'weekly');

      // Create new plan with proper data structure
      const planData = {
        user_id: user.id,
        study_type: studyType,
        plan_type: 'weekly',
        book_name: studyType === 'bible-book' ? selectedBook : null,
        topic_name: studyType === 'topical' ? selectedTopic : null,
        current_week: 1,
        current_chapter: 1,
        is_active: true,
        start_date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('worship_plans')
        .insert(planData)
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
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: `Failed to create worship plan: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlanProgress = async (weekNumber: number) => {
    if (!currentPlan) return;

    try {
      const { error } = await supabase
        .from('worship_plans')
        .update({ 
          current_week: weekNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPlan.id);

      if (error) throw error;

      setCurrentPlan({ ...currentPlan, current_week: weekNumber });
      
      toast({
        title: "Progress Updated",
        description: `Moved to week ${weekNumber}`
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  const generateWeeklyContent = (week: number) => {
    if (!currentPlan) return null;

    if (currentPlan.study_type === 'bible-book') {
      const book = currentPlan.book_name;
      return {
        title: `${book} - Week ${week}`,
        reading: `${book} Chapter ${week}`,
        theme: `Key themes from ${book} Chapter ${week}`,
        discussion: [
          `What stood out to you most in ${book} Chapter ${week}?`,
          'How can we apply these lessons in our daily lives?',
          'What does this chapter teach us about God\'s character?',
          'How can we pray about what we\'ve learned?'
        ],
        activity: `Family activity: Draw or act out a scene from ${book} Chapter ${week}`
      };
    } else {
      const topic = currentPlan.topic_name;
      return {
        title: `${topic} - Week ${week}`,
        reading: getTopicalReading(topic, week),
        theme: `Exploring ${topic} - Part ${week}`,
        discussion: getTopicalQuestions(topic, week),
        activity: getTopicalActivity(topic, week)
      };
    }
  };

  const getTopicalReading = (topic: string, week: number) => {
    const readings: { [key: string]: string[] } = {
      'Prayer and Faith': [
        'Matthew 6:5-15 - The Lord\'s Prayer',
        'James 5:13-18 - Prayer for Healing',
        'Luke 18:1-8 - Persistent Prayer',
        '1 Thessalonians 5:16-18 - Pray Without Ceasing'
      ],
      'God\'s Love and Grace': [
        'John 3:16-21 - God\'s Love for the World',
        'Romans 5:6-11 - Grace While We Were Sinners',
        'Ephesians 2:4-10 - Saved by Grace',
        '1 John 4:7-21 - God is Love'
      ]
    };
    
    return readings[topic]?.[week - 1] || `${topic} study - Week ${week}`;
  };

  const getTopicalQuestions = (topic: string, week: number) => {
    const baseQuestions = [
      `What does this passage teach us about ${topic.toLowerCase()}?`,
      'How can we apply this in our family life?',
      'What practical steps can we take this week?',
      'How can we share this truth with others?'
    ];
    
    return baseQuestions;
  };

  const getTopicalActivity = (topic: string, week: number) => {
    const activities: { [key: string]: string[] } = {
      'Prayer and Faith': [
        'Create a family prayer journal',
        'Practice different prayer positions',
        'Set up a prayer corner in your home',
        'Share answered prayers from this month'
      ],
      'God\'s Love and Grace': [
        'Write love notes to family members',
        'Do random acts of kindness',
        'Create artwork showing God\'s love',
        'Share testimonies of God\'s grace'
      ]
    };
    
    return activities[topic]?.[week - 1] || `${topic} activity - Week ${week}`;
  };

  useEffect(() => {
    fetchCurrentPlan();
  }, [user]);

  if (!currentPlan) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Weekly Worship Plan
            </h2>
            <p className="text-purple-100">Create a structured weekly worship experience</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create Your Weekly Plan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Type
                </label>
                <Select value={studyType} onValueChange={setStudyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bible-book">Bible Book Study</SelectItem>
                    <SelectItem value="topical">Topical Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {studyType === 'bible-book' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Bible Book
                  </label>
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BIBLE_BOOKS.map((book) => (
                        <SelectItem key={book} value={book}>{book}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {studyType === 'topical' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Topic
                  </label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPICAL_THEMES.map((topic) => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                onClick={createNewPlan}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                {loading ? 'Creating...' : 'Create Weekly Plan'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const weekContent = generateWeeklyContent(currentPlan.current_week);
  const totalWeeks = 12; // Default to 12 weeks
  const progress = (currentPlan.current_week / totalWeeks) * 100;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Weekly Worship Plan
              </h2>
              <p className="text-purple-100">{weekContent?.title}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">Week {currentPlan.current_week}</div>
              <div className="text-purple-200">of {totalWeeks}</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="bg-purple-700" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Button
          onClick={() => updatePlanProgress(Math.max(1, currentPlan.current_week - 1))}
          disabled={currentPlan.current_week <= 1}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Pause className="w-4 h-4" />
          Previous Week
        </Button>
        
        <Button
          onClick={() => updatePlanProgress(Math.min(totalWeeks, currentPlan.current_week + 1))}
          disabled={currentPlan.current_week >= totalWeeks}
          className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Next Week
        </Button>
      </div>

      {weekContent && (
        <div className="space-y-4">
          <WeekSection
            icon={Book}
            title="This Week's Reading"
            content={weekContent.reading}
            color="bg-blue-50 border-blue-200"
          />

          <WeekSection
            icon={Heart}
            title="Theme Focus"
            content={weekContent.theme}
            color="bg-pink-50 border-pink-200"
          />

          <WeekSection
            icon={MessageCircle}
            title="Discussion Questions"
            color="bg-green-50 border-green-200"
          >
            <ol className="space-y-2">
              {weekContent.discussion.map((question: string, index: number) => (
                <li key={index} className="flex">
                  <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{question}</span>
                </li>
              ))}
            </ol>
          </WeekSection>

          <WeekSection
            icon={Play}
            title="Family Activity"
            content={weekContent.activity}
            color="bg-amber-50 border-amber-200"
          />
        </div>
      )}

      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Plan Progress</span>
            <span className="text-sm font-medium">{currentPlan.current_week} / {totalWeeks} weeks</span>
          </div>
          <Progress value={progress} className="mt-2" />
        </div>
      </Card>
    </div>
  );
};

const WeekSection: React.FC<{
  icon: React.ElementType;
  title: string;
  content?: string;
  children?: React.ReactNode;
  color: string;
}> = ({ icon: Icon, title, content, children, color }) => {
  return (
    <Card className={`border-2 ${color} shadow-sm`}>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Icon className="w-5 h-5 mr-2 text-gray-600" />
          {title}
        </h3>
        {content && <p className="text-gray-700 leading-relaxed">{content}</p>}
        {children}
      </div>
    </Card>
  );
};
