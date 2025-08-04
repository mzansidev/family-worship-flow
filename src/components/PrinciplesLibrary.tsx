
import React, { useState } from 'react';
import { Lightbulb, Users, Heart, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const PrinciplesLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Lightbulb,
      color: 'from-green-500 to-green-600',
      articles: [
        { title: 'Why Family Worship Matters', readTime: '3 min' },
        { title: 'Setting Up Your First Family Worship', readTime: '5 min' },
        { title: 'Creating the Right Environment', readTime: '4 min' },
      ]
    },
    {
      id: 'engaging-children',
      title: 'Engaging Children',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      articles: [
        { title: 'Making Worship Fun for Young Children', readTime: '6 min' },
        { title: 'Age-Appropriate Discussion Techniques', readTime: '4 min' },
        { title: 'Using Visual Aids and Object Lessons', readTime: '5 min' },
        { title: 'Handling Disruptions with Grace', readTime: '3 min' },
      ]
    },
    {
      id: 'building-consistency',
      title: 'Building Consistency',
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      articles: [
        { title: 'Overcoming the Consistency Challenge', readTime: '7 min' },
        { title: 'Finding the Right Time for Your Family', readTime: '4 min' },
        { title: 'What to Do When You Miss Days', readTime: '3 min' },
        { title: 'Building Sustainable Habits', readTime: '6 min' },
      ]
    },
    {
      id: 'spiritual-growth',
      title: 'Deepening Faith',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
      articles: [
        { title: 'Moving Beyond Surface-Level Discussions', readTime: '8 min' },
        { title: 'Encouraging Teen Participation', readTime: '6 min' },
        { title: 'Handling Difficult Bible Topics', readTime: '7 min' },
        { title: 'Prayer Techniques for Families', readTime: '5 min' },
      ]
    }
  ];

  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    if (category) {
      return (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-orange-600 hover:text-orange-700 flex items-center text-sm font-medium transition-colors"
          >
            ← Back to categories
          </button>
          
          <Card className={`bg-gradient-to-r ${category.color} text-white border-0`}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <category.icon className="w-6 h-6 mr-2" />
                {category.title}
              </h2>
              <p className="text-white/90">Practical guidance for meaningful family worship</p>
            </div>
          </Card>

          <div className="space-y-3">
            {category.articles.map((article, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <BookOpen className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{article.title}</h3>
                      <p className="text-sm text-gray-500">{article.readTime} read</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2" />
            Principles Library
          </h2>
          <p className="text-orange-100">Learn how to build meaningful family worship</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className={`bg-gradient-to-br ${category.color} p-4 text-white`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/70" />
                </div>
                <h3 className="text-lg font-bold mb-1">{category.title}</h3>
                <p className="text-white/90 text-sm">{category.articles.length} articles</p>
              </div>
              <div className="bg-white p-3">
                <div className="text-gray-600 text-xs">Tap to explore topics</div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <div className="p-4">
          <h3 className="font-semibold text-amber-800 mb-2">💡 Featured Tip</h3>
          <p className="text-amber-700 text-sm">
            Start small and be consistent. Even 5-10 minutes of daily family worship 
            creates lasting spiritual bonds and memories for your children.
          </p>
        </div>
      </Card>
    </div>
  );
};
