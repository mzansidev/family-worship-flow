
import React, { useState } from 'react';
import { Calendar, BookOpen, Lightbulb, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DailyWorshipPlan } from './DailyWorshipPlan';
import { WeeklyWorshipPlan } from './WeeklyWorshipPlan';
import { PrinciplesLibrary } from './PrinciplesLibrary';
import { Dashboard } from './Dashboard';

type ActiveFeature = 'dashboard' | 'daily' | 'weekly' | 'principles' | 'profile' | 'auth' | 'about';

interface FeatureTilesProps {
  onNavigate?: (feature: ActiveFeature) => void;
}

export const FeatureTiles: React.FC<FeatureTilesProps> = ({ onNavigate }) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'daily',
      title: 'Daily Worship Plan',
      description: 'Generate personalized daily worship experiences',
      icon: Calendar,
      color: 'from-emerald-500 to-emerald-600',
      component: DailyWorshipPlan
    },
    {
      id: 'weekly',
      title: 'Weekly Worship Plan',
      description: 'Study Bible books together over the week',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      component: WeeklyWorshipPlan
    },
    {
      id: 'principles',
      title: 'Principles Library',
      description: 'Tips and resources for meaningful family worship',
      icon: Lightbulb,
      color: 'from-orange-500 to-orange-600',
      component: PrinciplesLibrary
    },
    {
      id: 'dashboard',
      title: 'Dashboard & Profile',
      description: 'Track progress and celebrate milestones',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      component: Dashboard
    }
  ];

  const handleFeatureClick = (featureId: string) => {
    if (onNavigate) {
      // Use the parent's navigation handler to update the main dashboard state
      onNavigate(featureId as ActiveFeature);
    } else {
      // Fallback to local state if no parent handler
      setActiveFeature(featureId);
    }
  };

  if (activeFeature && !onNavigate) {
    const feature = features.find(f => f.id === activeFeature);
    if (feature) {
      const Component = feature.component;
      return (
        <div>
          <button
            onClick={() => setActiveFeature(null)}
            className="mb-6 text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium transition-colors"
          >
            ← Back to main menu
          </button>
          <Component />
        </div>
      );
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feature) => {
        const IconComponent = feature.icon;
        return (
          <Card
            key={feature.id}
            className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            onClick={() => handleFeatureClick(feature.id)}
          >
            <div className={`bg-gradient-to-br ${feature.color} p-6 text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-all duration-300">
                  <IconComponent className="w-8 h-8" />
                </div>
                <div className="text-3xl font-light opacity-20">→</div>
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/90 text-sm leading-relaxed">{feature.description}</p>
            </div>
            <div className="bg-white p-4">
              <div className="text-gray-600 text-sm">Tap to explore</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
