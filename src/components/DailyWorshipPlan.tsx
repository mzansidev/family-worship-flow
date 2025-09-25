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
  const { updateStats, refetch } = useUserStats();

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

  const getRecommendedTime = (age: string) => {
    const timeRecommendations = {
      child: '10-15 minutes',
      teen: '15-20 minutes', 
      adult: '20-30 minutes',
      family: '15-25 minutes'
    };
    return timeRecommendations[age as keyof typeof timeRecommendations] || '15-25 minutes';
  };

  const getTopicalSongs = (theme: string) => {
    const songsByTheme: { [key: string]: string[] } = {
      'Prayer and Faith': [
        'What a Friend We Have in Jesus (SDAH #124)',
        'Sweet Hour of Prayer (SDAH #478)',
        'Jesus Loves Even Me (SDAH #167)',
        'A Shelter in the Time of Storm (SDAH #528)'
      ],
      'God\'s Love': [
        'Amazing Grace (SDAH #108)',
        'Love Divine (SDAH #92)',
        'Jesus Loves Me (SDAH #648)',
        'God So Loved the World (SDAH #136)'
      ],
      'Creation': [
        'This Is My Father\'s World (SDAH #61)',
        'All Creatures of Our God and King (SDAH #2)',
        'For the Beauty of the Earth (SDAH #60)',
        'How Great Thou Art (SDAH #86)'
      ],
      'Praise and Worship': [
        'Praise to the Lord (SDAH #1)',
        'Holy, Holy, Holy (SDAH #3)',
        'All People That on Earth Do Dwell (SDAH #16)',
        'O Worship the Lord (SDAH #6)'
      ],
      'Faith and Trust': [
        'A Mighty Fortress (SDAH #506)',
        'All the Way (SDAH #516)',
        'Be Thou My Vision (SDAH #547)',
        'Faith Is the Victory (SDAH #592)'
      ],
      'Salvation': [
        'Blessed Assurance (SDAH #462)',
        'Rock of Ages (SDAH #114)',
        'At Calvary (SDAH #115)',
        'I Know That My Redeemer Lives (SDAH #120)'
      ]
    };

    // Find matching theme or use general praise songs
    const themeKey = Object.keys(songsByTheme).find(key => 
      theme.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(theme.toLowerCase())
    );
    
    return songsByTheme[themeKey] || songsByTheme['Praise and Worship'];
  };

  const generateRandomPlan = () => {
    const themes = [
      'God as Our Shepherd', 'Walking in Faith', 'God\'s Love for Us',
      'Trusting in Prayer', 'Following Jesus', 'God\'s Creation',
      'Serving Others', 'God\'s Forgiveness', 'Growing in Faith',
      'Praise and Worship', 'Salvation by Grace', 'Christian Living'
    ];
    
    const passages = [
      'Psalm 23:1-6 - The Lord is My Shepherd',
      'John 3:16-17 - God\'s Love for the World', 
      'Philippians 4:13 - I Can Do All Things Through Christ',
      'Matthew 28:19-20 - The Great Commission',
      'Psalm 139:13-16 - Fearfully and Wonderfully Made',
      'Romans 8:28 - All Things Work Together for Good',
      'Ephesians 2:8-9 - Saved by Grace Through Faith',
      'Matthew 6:25-34 - Do Not Worry',
      'Isaiah 40:28-31 - They That Wait Upon the Lord'
    ];

    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const themeSongs = getTopicalSongs(randomTheme);
    
    return {
      openingSong: themeSongs[Math.floor(Math.random() * themeSongs.length)],
      bibleReading: passages[Math.floor(Math.random() * passages.length)],
      discussion: generateDiscussionQuestions(randomTheme, ageRange),
      application: `This week, look for one way God has shown you ${randomTheme.toLowerCase()}. Share it with your family during your next worship time.`,
      closingSong: themeSongs[Math.floor(Math.random() * themeSongs.length)],
      theme: randomTheme,
      recommendedTime: getRecommendedTime(ageRange)
    };
  };

  const fetchTodaysPlan = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    console.log('[DailyWorshipPlan] fetchTodaysPlan for', { userId: user.id, today, planSource });

    try {
      // Fetch the most recent entry with role assignment data
      const { data: plans } = await supabase
        .from('daily_worship_entries')
        .select(`
          *,
          leader:family_members!leader_id(name),
          assistant:family_members!assistant_id(name)
        `)
        .eq('user_id', user.id as any)
        .eq('date', today as any)
        .order('created_at', { ascending: false })
        .limit(1);

      const existingPlan = plans && plans.length > 0 ? plans[0] : null;

      if (existingPlan && typeof existingPlan === 'object') {
        if (planSource === 'random') {
          const randomDerived = generateRandomPlan();
          await supabase
            .from('daily_worship_entries')
            .update({
              opening_song: randomDerived.openingSong,
              bible_reading: randomDerived.bibleReading,
              discussion_questions: randomDerived.discussion,
              application: randomDerived.application,
              closing_song: randomDerived.closingSong,
              theme: randomDerived.theme,
              worship_plan_id: null,
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', (existingPlan as any).id);
          const enrichedPlan = {
            ...randomDerived,
            leaderId: (existingPlan as any).leader_id,
            assistantId: (existingPlan as any).assistant_id,
            leaderName: (existingPlan as any).leader?.[0]?.name,
            assistantName: (existingPlan as any).assistant?.[0]?.name,
            familyMembersPresent: (existingPlan as any).family_members_present || []
          };
          setCurrentPlan(enrichedPlan);
          setIsCompleted((existingPlan as any).is_completed || false);
          return;
        } else {
          const { data: weeklyPlan } = await supabase
            .from('worship_plans')
            .select('id, study_type, book_name, topic_name, current_chapter')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .eq('plan_type', 'weekly')
            .maybeSingle();

          const weeklyDerived = await generateWeeklyPlan();
          const linkId = weeklyPlan ? (weeklyPlan as any).id : null;

          await supabase
            .from('daily_worship_entries')
            .update({
              opening_song: weeklyDerived.openingSong,
              bible_reading: weeklyDerived.bibleReading,
              discussion_questions: weeklyDerived.discussion,
              application: weeklyDerived.application,
              closing_song: weeklyDerived.closingSong,
              theme: weeklyDerived.theme,
              worship_plan_id: linkId,
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', (existingPlan as any).id);
          const enrichedPlan = {
            ...weeklyDerived,
            leaderId: (existingPlan as any).leader_id,
            assistantId: (existingPlan as any).assistant_id,
            leaderName: (existingPlan as any).leader?.[0]?.name,
            assistantName: (existingPlan as any).assistant?.[0]?.name,
            familyMembersPresent: (existingPlan as any).family_members_present || []
          };
          setCurrentPlan(enrichedPlan);
          setIsCompleted((existingPlan as any).is_completed || false);
          return;
        }
      }

      // No existing entry: generate plan based on source selection
      let newPlan;
      let worshipPlanId: string | null = null;
      if (planSource === 'weekly') {
        const { data: weeklyPlan } = await supabase
          .from('worship_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('plan_type', 'weekly')
          .maybeSingle();

        newPlan = await generateWeeklyPlan();
        worshipPlanId = weeklyPlan ? (weeklyPlan as any).id : null;
      } else {
        newPlan = generateRandomPlan();
      }
      
      setCurrentPlan(newPlan);

      // Save to database
      const { error: insertErr } = await supabase
        .from('daily_worship_entries')
        .insert({
          user_id: user.id,
          date: today as any,
          opening_song: newPlan.openingSong,
          bible_reading: newPlan.bibleReading,
          discussion_questions: newPlan.discussion,
          application: newPlan.application,
          closing_song: newPlan.closingSong,
          theme: newPlan.theme,
          worship_plan_id: worshipPlanId,
          is_completed: false
        } as any);

      if (insertErr) {
        console.error("Error inserting today's plan:", insertErr);
      }
    } catch (error) {
      console.error('Error in fetchTodaysPlan:', error);
      // As a safety, ensure UI doesn't get stuck on loading
      if (!currentPlan) {
        const fallbackPlan = generateRandomPlan();
        setCurrentPlan(fallbackPlan);
      }
    }
  };

  const generateWeeklyPlan = async () => {
    if (!user) return generateRandomPlan();

    try {
      // Get active weekly plan
      const { data: weeklyPlan, error } = await supabase
        .from('worship_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('plan_type', 'weekly')
        .maybeSingle();

      if (error || !weeklyPlan) {
        console.log('No active weekly plan found, using random');
        return generateRandomPlan();
      }

      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday=0 index

      if (weeklyPlan.study_type === 'book') {
        const chapter = weeklyPlan.current_chapter;
        const versesPerDay = 5;
        const startVerse = mondayIndex * versesPerDay + 1;
        const endVerse = startVerse + versesPerDay - 1;
        const bookThemeSongs = getTopicalSongs('Faith and Trust');

        return {
          openingSong: bookThemeSongs[Math.floor(Math.random() * bookThemeSongs.length)],
          bibleReading: `${weeklyPlan.book_name} ${chapter}:${startVerse}-${endVerse} - ${weeklyPlan.book_name} Chapter ${chapter}`,
          discussion: generateDiscussionQuestions(`${weeklyPlan.book_name} Study`, ageRange),
          application: `This week, reflect on the lessons from ${weeklyPlan.book_name} chapter ${chapter}. Consider how these verses apply to your daily walk with God.`,
          closingSong: bookThemeSongs[Math.floor(Math.random() * bookThemeSongs.length)],
          theme: `${weeklyPlan.book_name} Chapter ${chapter} - Day ${mondayIndex + 1}`,
          recommendedTime: getRecommendedTime(ageRange)
        };
      } else {
        const topicSongs = getTopicalSongs(weeklyPlan.topic_name);
        const fullReading = getTopicalReading(weeklyPlan.topic_name, mondayIndex);
        
        return {
          openingSong: topicSongs[Math.floor(Math.random() * topicSongs.length)],
          bibleReading: fullReading,
          discussion: generateDiscussionQuestions(weeklyPlan.topic_name, ageRange),
          application: `Continue exploring ${weeklyPlan.topic_name}. Look for ways to apply today's insights throughout your week.`,
          closingSong: topicSongs[Math.floor(Math.random() * topicSongs.length)],
          theme: `${weeklyPlan.topic_name} - Day ${mondayIndex + 1}`,
          recommendedTime: getRecommendedTime(ageRange)
        };
      }
    } catch (error) {
      console.error('Error generating weekly plan:', error);
      return generateRandomPlan();
    }
  };

  const getTopicalReading = (topic: string, dayIndex: number) => {
    const readings: { [key: string]: string[] } = {
      'Prayer and Faith': [
        'Matthew 6:5-15 - The Lord\'s Prayer',
        'James 5:13-18 - Prayer for Healing',
        'Luke 18:1-8 - Persistent Prayer',
        '1 Thessalonians 5:16-18 - Pray Without Ceasing',
        'Matthew 21:22 - Faith in Prayer',
        'Philippians 4:6-7 - Prayer and Peace',
        '1 John 5:14-15 - Confidence in Prayer'
      ],
      'God\'s Love and Grace': [
        'John 3:16-21 - God\'s Love for the World',
        'Romans 5:6-11 - Grace While We Were Sinners',
        'Ephesians 2:4-10 - Saved by Grace',
        '1 John 4:7-21 - God is Love',
        'Romans 8:35-39 - Nothing Separates Us',
        'Titus 3:4-7 - God\'s Kindness and Love',
        'Psalm 103:8-14 - God\'s Compassion'
      ]
    };
    
    return readings[topic]?.[dayIndex] || `${topic} study - Day ${dayIndex + 1}`;
  };

  const handleMarkCompleted = async () => {
    if (!user || !currentPlan) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Update the daily entry as completed
      const { error } = await supabase
        .from('daily_worship_entries')
        .update({ is_completed: true } as any)
        .eq('user_id', user.id as any)
        .eq('date', today as any);

      if (error) throw error;

      setIsCompleted(true);
      
      // Update user stats - this will handle streak calculation
      await updateStats(true);
      
      // Refresh stats to get updated values
      await refetch();
      
      toast({
        title: "Congratulations! 🎉",
        description: "Today's worship session completed! Your streak and stats have been updated."
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

    let newPlan;
    let worshipPlanId: string | null = null;
    if (planSource === 'weekly') {
      newPlan = await generateWeeklyPlan();
      if (user) {
        const { data: weeklyPlan } = await supabase
          .from('worship_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('plan_type', 'weekly')
          .maybeSingle();
        worshipPlanId = weeklyPlan ? (weeklyPlan as any).id : null;
      }
    } else {
      newPlan = generateRandomPlan();
    }

    setCurrentPlan(newPlan);

    if (user) {
      const today = new Date().toISOString().split('T')[0];

      // Safely get the latest entry for today to update or insert
      const { data: existingRows } = await supabase
        .from('daily_worship_entries')
        .select('id')
        .eq('user_id', user.id as any)
        .eq('date', today as any)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingRows && existingRows.length > 0) {
        const existingId = (existingRows[0] as any).id;
        await supabase
          .from('daily_worship_entries')
          .update({
            opening_song: newPlan.openingSong,
            bible_reading: newPlan.bibleReading,
            discussion_questions: newPlan.discussion,
            application: newPlan.application,
            closing_song: newPlan.closingSong,
            theme: newPlan.theme,
            worship_plan_id: worshipPlanId,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', existingId);
      } else {
        await supabase
          .from('daily_worship_entries')
          .insert({
            user_id: user.id,
            date: today as any,
            opening_song: newPlan.openingSong,
            bible_reading: newPlan.bibleReading,
            discussion_questions: newPlan.discussion,
            application: newPlan.application,
            closing_song: newPlan.closingSong,
            theme: newPlan.theme,
            worship_plan_id: worshipPlanId
          } as any);
      }
    }
    
    setLoading(false);
  };

  const updateUserPreferences = async () => {
    if (!user) return;

    // Replace upsert with explicit check-then-update/insert to avoid onConflict errors
    const { data: existing, error: existErr } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id as any)
      .maybeSingle();

    if (!existErr && existing) {
      await supabase
        .from('user_preferences')
        .update({
          daily_plan_source: planSource,
          default_age_range: ageRange
        } as any)
        .eq('id', (existing as any).id);
    } else {
      await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          daily_plan_source: planSource,
          default_age_range: ageRange
        } as any);
    }
  };

  // Fetch today's plan whenever user or source changes
  useEffect(() => {
    if (user) {
      fetchTodaysPlan();
    }
  }, [user, planSource]);

  // Load user preferences only on user change (avoid overwriting user's selection on change)
  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id as any)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data && typeof data === 'object' && 'daily_plan_source' in data) {
          setPlanSource(((data as any).daily_plan_source as PlanSource) || 'random');
          setAgeRange((data as any).default_age_range || 'family');
        }
      });
  }, [user]);

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

      {/* Time Recommendation */}
      {currentPlan.recommendedTime && (
        <Card className="border-2 bg-indigo-50 border-indigo-200 shadow-sm">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
              Recommended Duration
            </h3>
            <p className="text-indigo-700 font-medium">{currentPlan.recommendedTime}</p>
            {ageRange === 'child' && (
              <p className="text-sm text-indigo-600 mt-1">
                Shorter sessions work best for young children. Keep it engaging with songs and interactive activities.
              </p>
            )}
          </div>
        </Card>
      )}

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

        {/* Role Assignments */}
        {currentPlan.leaderId && (
          <Card className="border-2 bg-emerald-50 border-emerald-200 shadow-sm">
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-gray-600" />
                Today's Worship Roles
              </h3>
              <div className="space-y-2">
                {currentPlan.leaderId && (
                  <div className="flex items-center">
                    <span className="bg-emerald-200 text-emerald-800 px-2 py-1 rounded text-sm font-medium mr-2">
                      Leader
                    </span>
                    <span className="text-gray-700">{currentPlan.leaderName || currentPlan.leaderId}</span>
                  </div>
                )}
                {currentPlan.assistantId && (
                  <div className="flex items-center">
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-medium mr-2">
                      Assistant
                    </span>
                    <span className="text-gray-700">{currentPlan.assistantName || currentPlan.assistantId}</span>
                  </div>
                )}
                {currentPlan.familyMembersPresent && currentPlan.familyMembersPresent.length > 0 && (
                  <div className="flex items-start">
                    <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded text-sm font-medium mr-2 mt-0.5">
                      Present
                    </span>
                    <span className="text-gray-700">{currentPlan.familyMembersPresent.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        <PlanSection
          icon={MessageCircle}
          title="Discussion Questions"
          color="bg-orange-50 border-orange-200"
        >
          <ol className="space-y-2">
            {Array.isArray(currentPlan.discussion) && currentPlan.discussion.map((question: string, index: number) => (
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
