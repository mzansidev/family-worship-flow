import React, { useState, useEffect } from 'react';
import { RefreshCw, Music, Book, MessageCircle, Target, Users, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserStats } from '@/hooks/useUserStats';

type PlanSource = 'random' | 'weekly';

export const DailyWorshipPlan = () => {
  const [ageRange, setAgeRange] = useState('family');
  const [planSource, setPlanSource] = useState<PlanSource>('random');
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateStats } = useUserStats();

  const generateRandomPlan = () => {
    const themes = [
      'God as Our Shepherd', 'Walking in Faith', 'God\'s Love for Us',
      'Trusting in Prayer', 'Following Jesus', 'God\'s Creation',
      'Serving Others', 'God\'s Forgiveness', 'Growing in Faith'
    ];
    
    const songs = [
      'Be Thou My Vision (SDAH #547)', 'How Great Thou Art (SDAH #86)',
      'Amazing Grace (SDAH #108)', 'Jesus Loves Me (SDAH #648)',
      'This Is My Father\'s World (SDAH #61)', 'What a Friend We Have in Jesus (SDAH #124)'
    ];

    const passages = [
      'Psalm 23:1-6 - The Lord is My Shepherd',
      'John 3:16 - God\'s Love for the World',
      'Philippians 4:13 - I Can Do All Things',
      'Matthew 28:20 - Jesus Is Always With Us',
      'Psalm 139:14 - Wonderfully Made',
      'Romans 8:28 - All Things Work Together'
    ];

    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    
    return {
      openingSong: songs[Math.floor(Math.random() * songs.length)],
      bibleReading: passages[Math.floor(Math.random() * passages.length)],
      discussion: generateDiscussionQuestions(randomTheme, ageRange),
      application: `This week, look for one way God has shown you ${randomTheme.toLowerCase()}. Share it with your family during your next worship time.`,
      closingSong: songs[Math.floor(Math.random() * songs.length)],
      theme: randomTheme
    };
  };

  const generateDiscussionQuestions = (theme: string, age: string) => {
    const baseQuestions = [
      `What does today's passage teach us about ${theme.toLowerCase()}?`,
      'How can we apply this lesson in our daily lives?',
      'What are some ways we can remember this truth throughout the week?'
    ];

    const ageSpecific = {
      child: [
        'Can you draw a picture of what this story means?',
        'What would you tell a friend about God from this story?'
      ],
      teen: [
        'How does this apply to challenges you face at school?',
        'What questions does this raise for you about faith?'
      ],
      adult: [
        'How has God demonstrated this truth in your life experience?',
        'What practical steps can we take to live this out?'
      ],
      family: [
        'How can our family show others this truth about God?',
        'What is one thing each of us can do this week to practice this?'
      ]
    };

    return [...baseQuestions, ...ageSpecific[age as keyof typeof ageSpecific]];
  };

  const fetchTodaysPlan = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's already a plan for today
    const { data: existingPlan } = await supabase
      .from('daily_worship_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (existingPlan) {
      setCurrentPlan({
        openingSong: existingPlan.opening_song,
        bibleReading: existingPlan.bible_reading,
        discussion: existingPlan.discussion_questions,
        application: existingPlan.application,
        closingSong: existingPlan.closing_song,
        theme: existingPlan.theme
      });
      setIsCompleted(existingPlan.is_completed || false);
      return;
    }

    // Generate random plan
    const randomPlan = generateRandomPlan();
    setCurrentPlan(randomPlan);
    
    // Save to database
    await supabase
      .from('daily_worship_entries')
      .upsert([{
        user_id: user.id,
        date: today,
        opening_song: randomPlan.openingSong,
        bible_reading: randomPlan.bibleReading,
        discussion_questions: randomPlan.discussion,
        application: randomPlan.application,
        closing_song: randomPlan.closingSong,
        theme: randomPlan.theme,
        is_completed: false
      }], { onConflict: 'user_id,date' });
  };

  const handleMarkCompleted = async () => {
    if (!user || !currentPlan) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      await supabase
        .from('daily_worship_entries')
        .update({ is_completed: true })
        .eq('user_id', user.id)
        .eq('date', today);

      setIsCompleted(true);
      await updateStats(true);
      
      toast({
        title: "Great job!",
        description: "Today's worship session marked as complete!"
      });
    } catch (error) {
      console.error('Error marking complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark as complete",
        variant: "destructive"
      });
    }
  };

  const handleGenerateNew = async () => {
    setLoading(true);
    const newPlan = generateRandomPlan();
    setCurrentPlan(newPlan);

    if (user) {
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('daily_worship_entries')
        .upsert([{
          user_id: user.id,
          date: today,
          opening_song: newPlan.openingSong,
          bible_reading: newPlan.bibleReading,
          discussion_questions: newPlan.discussion,
          application: newPlan.application,
          closing_song: newPlan.closingSong,
          theme: newPlan.theme
        }], { onConflict: 'user_id,date' });
    }
    
    setLoading(false);
  };

  const updateUserPreferences = async () => {
    if (!user) return;

    await supabase
      .from('user_preferences')
      .upsert([{
        user_id: user.id,
        daily_plan_source: planSource,
        default_age_range: ageRange
      }], { onConflict: 'user_id' });
  };

  useEffect(() => {
    if (user) {
      fetchTodaysPlan();
      // Load user preferences
      supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setPlanSource(data.daily_plan_source as PlanSource);
            setAgeRange(data.default_age_range || 'family');
          }
        });
    }
  }, [user, planSource]);

  useEffect(() => {
    if (user) {
      updateUserPreferences();
    }
  }, [planSource, ageRange]);

  if (!currentPlan) {
    return <div className="text-center p-8">Loading today's worship plan...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Music className="w-6 h-6 mr-2" />
                Daily Worship Plan
              </h2>
              <p className="text-emerald-100">Today's Theme: {currentPlan.theme}</p>
            </div>
            {isCompleted && (
              <div className="bg-white/20 p-2 rounded-full">
                <Check className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Source
          </label>
          <Select value={planSource} onValueChange={(value: PlanSource) => setPlanSource(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">Random Plans</SelectItem>
              <SelectItem value="weekly">Follow Weekly Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Range
          </label>
          <Select value={ageRange} onValueChange={setAgeRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="child">Children (5-10)</SelectItem>
              <SelectItem value="teen">Teens (11-17)</SelectItem>
              <SelectItem value="adult">Adults (18+)</SelectItem>
              <SelectItem value="family">Mixed Family</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              onClick={handleGenerateNew}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {loading ? 'Generating...' : 'New Plan'}
            </Button>
            
            {!isCompleted && (
              <Button
                onClick={handleMarkCompleted}
                variant="outline"
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Complete
              </Button>
            )}
            
            {isCompleted && (
              <Button
                disabled
                className="bg-green-100 text-green-800 flex items-center gap-2 cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Completed
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <PlanSection
          icon={Music}
          title="Opening Song"
          content={currentPlan.openingSong}
          color="bg-blue-50 border-blue-200"
        />

        <PlanSection
          icon={Book}
          title="Bible Reading"
          content={currentPlan.bibleReading}
          color="bg-purple-50 border-purple-200"
        />

        <PlanSection
          icon={MessageCircle}
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
          title="Practical Application"
          content={currentPlan.application}
          color="bg-green-50 border-green-200"
        />

        <PlanSection
          icon={Music}
          title="Closing Song"
          content={currentPlan.closingSong}
          color="bg-blue-50 border-blue-200"
        />

        <PlanSection
          icon={Users}
          title="Closing Prayer"
          content="Take turns sharing one thing you're grateful for, then close with a family prayer."
          color="bg-amber-50 border-amber-200"
        />
      </div>
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
