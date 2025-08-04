
import React, { useState } from 'react';
import { RefreshCw, Music, Book, MessageCircle, Target, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const DailyWorshipPlan = () => {
  const [ageRange, setAgeRange] = useState('family');
  const [currentPlan, setCurrentPlan] = useState(generatePlan());

  function generatePlan() {
    const plans = {
      openingSong: 'Be Thou My Vision (SDAH #547)',
      bibleReading: 'Psalm 23:1-6 - The Lord is My Shepherd',
      discussion: [
        'What does it mean that God is our shepherd?',
        'How does God guide us in our daily lives?',
        'What are some "green pastures" God has provided for our family?',
        'How can we trust God when we face difficulties?',
        'What does it mean to "fear no evil" when God is with us?'
      ],
      application: 'This week, look for one way God has been your shepherd. Share it with your family during your next worship time.',
      closingSong: 'How Great Thou Art (SDAH #86)',
      theme: 'God as Our Shepherd'
    };
    return plans;
  }

  const handleGenerateNew = () => {
    setCurrentPlan(generatePlan());
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Music className="w-6 h-6 mr-2" />
            Daily Worship Plan
          </h2>
          <p className="text-emerald-100">Today's Theme: {currentPlan.theme}</p>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Range
          </label>
          <Select value={ageRange} onValueChange={setAgeRange}>
            <SelectTrigger className="w-full">
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
        <Button 
          onClick={handleGenerateNew}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Generate New Plan
        </Button>
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
            {currentPlan.discussion.map((question, index) => (
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
