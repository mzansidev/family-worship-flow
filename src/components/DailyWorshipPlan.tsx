import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, BookOpen, Heart, MessageCircle, Target, Shuffle } from 'lucide-react';

interface DailyPlan {
  openingSong: string;
  bibleReading: string;
  theme: string;
  discussion: string[];
  application: string;
  closingSong: string;
}

export const DailyWorshipPlan = () => {
  const [currentPlan, setCurrentPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodaysPlan();
  }, []);

  const fetchTodaysPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate fetching a plan from an API or local storage
      // For now, we'll just generate a random plan
      const plan = generateRandomPlan();
      setCurrentPlan(plan);
    } catch (err) {
      setError('Failed to load today\'s worship plan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewPlan = () => {
    setLoading(true);
    setError(null);
    try {
      const newPlan = generateRandomPlan();
      setCurrentPlan(newPlan);
    } catch (err) {
      setError('Failed to generate a new plan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = () => {
    // Implement save logic here (e.g., save to local storage or API)
    alert('Plan saved! (This feature is not yet implemented)');
  };

  const generateRandomPlan = (): DailyPlan => {
    const songs = [
      "How Great Thou Art",
      "Amazing Grace",
      "Blessed Assurance",
      "Great Is Thy Faithfulness",
      "Holy, Holy, Holy",
      "What a Friend We Have in Jesus"
    ];

    const readings = [
      "Psalm 23:1-6",
      "John 3:16-21",
      "Romans 8:28-39",
      "Philippians 4:4-13",
      "1 Corinthians 13:1-13",
      "Matthew 5:3-12"
    ];

    const themes = [
      "God's Love and Grace",
      "Faith and Trust in God",
      "God's Provision and Care",
      "Walking with God Daily",
      "God's Strength in Weakness",
      "Praising God in All Circumstances"
    ];

    const discussions = [
      [
        "How do you see God working in your life today?",
        "What is one thing you're grateful for?",
        "How can we show God's love to others?"
      ],
      [
        "What does this passage teach us about God?",
        "How can we apply this to our daily lives?",
        "What can we pray for as a family?"
      ],
      [
        "What challenges are we facing that we can trust God with?",
        "How has God been faithful to our family?",
        "What is one way we can serve God together?"
      ]
    ];

    const applications = [
      "Look for opportunities to show kindness to someone today.",
      "Take time to pray together before making important decisions.",
      "Share one way God has blessed you with a friend or neighbor.",
      "Practice gratitude by naming three things you're thankful for.",
      "Read a Bible verse together during your next meal.",
      "Encourage each other with God's promises when facing difficulties."
    ];

    return {
      openingSong: songs[Math.floor(Math.random() * songs.length)],
      bibleReading: readings[Math.floor(Math.random() * readings.length)],
      theme: themes[Math.floor(Math.random() * themes.length)],
      discussion: discussions[Math.floor(Math.random() * discussions.length)],
      application: applications[Math.floor(Math.random() * applications.length)],
      closingSong: songs[Math.floor(Math.random() * songs.length)]
    };
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading today's worship plan...</p>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load worship plan. Please try again.</p>
        <Button 
          onClick={fetchTodaysPlan} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Today's Family Worship
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Opening Song */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Music className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Opening Song
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {currentPlan.openingSong}
              </p>
            </div>
          </div>
        </Card>

        {/* Bible Reading */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Bible Reading
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {currentPlan.bibleReading}
              </p>
            </div>
          </div>
        </Card>

        {/* Theme */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Today's Theme
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {currentPlan.theme}
              </p>
            </div>
          </div>
        </Card>

        {/* Discussion Questions */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <MessageCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Discussion Questions
              </h2>
              <ul className="space-y-2">
                {currentPlan.discussion.map((question, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      {index + 1}.
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {question}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Application */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
              <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Today's Application
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {currentPlan.application}
              </p>
            </div>
          </div>
        </Card>

        {/* Closing Song */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-rose-100 dark:bg-rose-900 p-3 rounded-full">
              <Music className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Closing Song
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {currentPlan.closingSong}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Generate New Plan Button */}
      <div className="text-center">
        <Button 
          onClick={handleGenerateNewPlan}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Generate New Plan
        </Button>
      </div>
    </div>
  );
};
