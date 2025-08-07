import React, { useState, useEffect } from 'react';
import { Calendar, Book, RefreshCw, Target, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WeeklyPlan {
  id?: string;
  week: number;
  date: string;
  theme: string;
  bibleReading: string;
  keyVerse: string;
  discussion: string[];
  activity: string;
  prayer: string;
}

export const WeeklyWorshipPlan = () => {
  const [studyType, setStudyType] = useState('book');
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [selectedTopic, setSelectedTopic] = useState('Faith');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const bibleBooks = [
    'Genesis', 'Exodus', 'Psalms', 'Proverbs', 'Matthew', 'Mark', 
    'Luke', 'John', 'Romans', 'Ephesians', 'Philippians', 'Colossians'
  ];

  const topics = [
    'Faith', 'Prayer', 'Love', 'Forgiveness', 'Gratitude', 'Hope',
    'Peace', 'Joy', 'Courage', 'Wisdom', 'Trust', 'Service'
  ];

  const generateBookStudyPlan = (book: string, startWeek: number = 1): WeeklyPlan[] => {
    const bookPlans: { [key: string]: WeeklyPlan[] } = {
      Genesis: [
        {
          week: 1,
          date: new Date().toISOString().split('T')[0],
          theme: 'In the Beginning',
          bibleReading: 'Genesis 1:1-31',
          keyVerse: 'In the beginning God created the heavens and the earth. - Genesis 1:1',
          discussion: [
            'What does it mean that God created everything?',
            'How can we take care of God\'s creation?',
            'What is your favorite part of God\'s creation?'
          ],
          activity: 'Go outside and observe God\'s creation. Draw or take photos of things that show God\'s creativity.',
          prayer: 'Thank God for creating such a beautiful world for us to enjoy.'
        }
      ],
      Psalms: [
        {
          week: 1,
          date: new Date().toISOString().split('T')[0],
          theme: 'The Lord is My Shepherd',
          bibleReading: 'Psalm 23:1-6',
          keyVerse: 'The Lord is my shepherd, I lack nothing. - Psalm 23:1',
          discussion: [
            'How is God like a shepherd to us?',
            'What does it mean that we "lack nothing" with God?',
            'How can we trust God to guide us?'
          ],
          activity: 'Create a visual representation of Psalm 23 using art supplies.',
          prayer: 'Ask God to be your shepherd and guide you in all you do.'
        }
      ]
    };

    return bookPlans[book] || [{
      week: startWeek,
      date: new Date().toISOString().split('T')[0],
      theme: `Studying ${book}`,
      bibleReading: `${book} 1:1-10`,
      keyVerse: `Key verse from ${book}`,
      discussion: [
        `What can we learn from ${book}?`,
        'How does this apply to our lives?',
        'What questions do we have?'
      ],
      activity: `Study and discuss ${book} together as a family.`,
      prayer: `Pray for understanding as we study ${book}.`
    }];
  };

  const generateTopicStudyPlan = (topic: string, startWeek: number = 1): WeeklyPlan[] => {
    const topicPlans: { [key: string]: WeeklyPlan[] } = {
      Faith: [
        {
          week: 1,
          date: new Date().toISOString().split('T')[0],
          theme: 'What is Faith?',
          bibleReading: 'Hebrews 11:1-6',
          keyVerse: 'Faith is confidence in what we hope for and assurance about what we do not see. - Hebrews 11:1',
          discussion: [
            'How would you explain faith to a friend?',
            'What are some things we believe in that we cannot see?',
            'How can our faith grow stronger?'
          ],
          activity: 'Share stories of times when faith helped you or someone you know.',
          prayer: 'Ask God to help your faith grow stronger each day.'
        }
      ]
    };

    return topicPlans[topic] || [{
      week: startWeek,
      date: new Date().toISOString().split('T')[0],
      theme: `Understanding ${topic}`,
      bibleReading: 'Psalm 119:105',
      keyVerse: 'Your word is a lamp for my feet, a light on my path. - Psalm 119:105',
      discussion: [
        `What does the Bible teach us about ${topic}?`,
        `How can we practice ${topic} in our daily lives?`,
        `Why is ${topic} important for Christians?`
      ],
      activity: `Find examples of ${topic} in Bible stories and discuss them.`,
      prayer: `Pray that God would help us understand and practice ${topic}.`
    }];
  };

  const fetchActivePlan = async () => {
    if (!user) return;

    try {
      const { data: plan, error } = await supabase
        .from('worship_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_type', 'weekly')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching active plan:', error);
        return;
      }

      if (plan) {
        setActivePlan(plan);
        if (plan.study_type === 'book') {
          setStudyType('book');
          setSelectedBook(plan.book_name || 'Genesis');
        } else {
          setStudyType('topic');
          setSelectedTopic(plan.topic_name || 'Faith');
        }
        setCurrentWeek(plan.current_week || 1);
      }
    } catch (error) {
      console.error('Error in fetchActivePlan:', error);
    }
  };

  const createNewPlan = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Deactivate existing plans
      await supabase
        .from('worship_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Create new plan
      const { data: newPlan, error } = await supabase
        .from('worship_plans')
        .insert({
          user_id: user.id,
          plan_type: 'weekly',
          study_type: studyType,
          book_name: studyType === 'book' ? selectedBook : null,
          topic_name: studyType === 'topic' ? selectedTopic : null,
          current_week: 1,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setActivePlan(newPlan);
      setCurrentWeek(1);
      
      // Generate plans
      const plans = studyType === 'book' 
        ? generateBookStudyPlan(selectedBook)
        : generateTopicStudyPlan(selectedTopic);
      
      setWeeklyPlans(plans);

      toast({
        title: "New plan created!",
        description: `Started ${studyType} study: ${studyType === 'book' ? selectedBook : selectedTopic}`
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create new plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = async (direction: 'prev' | 'next') => {
    if (!activePlan) return;

    const newWeek = direction === 'next' ? currentWeek + 1 : Math.max(1, currentWeek - 1);
    setCurrentWeek(newWeek);

    // Update in database
    await supabase
      .from('worship_plans')
      .update({ current_week: newWeek })
      .eq('id', activePlan.id);

    // Generate new plans if needed
    const plans = activePlan.study_type === 'book'
      ? generateBookStudyPlan(activePlan.book_name, newWeek)
      : generateTopicStudyPlan(activePlan.topic_name, newWeek);
    
    setWeeklyPlans(plans);
  };

  useEffect(() => {
    if (user) {
      fetchActivePlan();
    }
  }, [user]);

  useEffect(() => {
    if (activePlan) {
      const plans = activePlan.study_type === 'book'
        ? generateBookStudyPlan(activePlan.book_name, currentWeek)
        : generateTopicStudyPlan(activePlan.topic_name, currentWeek);
      setWeeklyPlans(plans);
    }
  }, [activePlan, currentWeek]);

  const currentPlan = weeklyPlans[0];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Weekly Worship Plan
          </h2>
          {activePlan ? (
            <p className="text-blue-100">
              Current Study: {activePlan.study_type === 'book' ? activePlan.book_name : activePlan.topic_name} - Week {currentWeek}
            </p>
          ) : (
            <p className="text-blue-100">Create a new weekly study plan to get started</p>
          )}
        </div>
      </Card>

      {!activePlan ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Weekly Plan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Type
              </label>
              <Select value={studyType} onValueChange={setStudyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Bible Book</SelectItem>
                  <SelectItem value="topic">Topic Study</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {studyType === 'book' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Book
                </label>
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bibleBooks.map(book => (
                      <SelectItem key={book} value={book}>{book}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Topic
                </label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              <Button 
                onClick={createNewPlan}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </Card>
      ) : currentPlan ? (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{currentPlan.theme}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                  disabled={currentWeek <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Week {currentWeek}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          <PlanSection
            icon={Book}
            title="Bible Reading"
            content={currentPlan.bibleReading}
            color="bg-purple-50 border-purple-200"
          />

          <PlanSection
            icon={Target}
            title="Key Verse"
            content={currentPlan.keyVerse}
            color="bg-green-50 border-green-200"
          />

          <PlanSection
            icon={Users}
            title="Discussion Questions"
            color="bg-orange-50 border-orange-200"
          >
            <ol className="space-y-2">
              {currentPlan.discussion.map((question: string, index: number) => (
                <li key={index} className="flex">
                  <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{question}</span>
                </li>
              ))}
            </ol>
          </PlanSection>

          <PlanSection
            icon={Target}
            title="Family Activity"
            content={currentPlan.activity}
            color="bg-blue-50 border-blue-200"
          />

          <PlanSection
            icon={Users}
            title="Prayer Focus"
            content={currentPlan.prayer}
            color="bg-amber-50 border-amber-200"
          />

          <Card className="p-4">
            <Button 
              onClick={createNewPlan}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Start New Plan
            </Button>
          </Card>
        </div>
      ) : (
        <div className="text-center p-8">Loading weekly plan...</div>
      )}
    </div>
  );
};

const PlanSection: React.FC<{
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
