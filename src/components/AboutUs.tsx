
import React from 'react';
import { Card } from '@/components/ui/card';
import { Heart, BookOpen, Users, Target, Star } from 'lucide-react';

export const AboutUs = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full">
            <Heart className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          About Family Pulse
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Empowering Christians to have God as the centre of their family through simple daily family worship plans.
        </p>
      </div>

      {/* Mission Card */}
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Family Pulse exists to help Christian families establish meaningful worship routines that bring God to the center of their daily lives. We believe that consistent family worship strengthens faith, builds deeper relationships, and creates lasting spiritual foundations for every family member.
            </p>
          </div>
        </div>
      </Card>

      {/* How to Use Section */}
      <Card className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
            <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              How to Use Family Pulse
            </h2>
          </div>
        </div>
        
        <div className="space-y-4 ml-16">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Daily Worship Plans</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Start each day with a personalized worship plan that includes opening songs, Bible readings, discussion questions, practical applications, and closing songs. Each plan is designed to take 10-15 minutes and can be adapted for any family size.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Weekly Worship Plans</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Dive deeper with structured weekly studies that guide your family through Bible books or explore specific topics over several days. Perfect for families wanting more comprehensive spiritual growth together.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Principles Library</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access helpful tips, resources, and guidance for creating meaningful family worship experiences. Learn how to engage children of different ages, handle difficult questions, and make worship a joy rather than a chore.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Track Your Progress</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor your family's worship journey with streak tracking, milestone celebrations, and reflection journals. See how consistency in family worship strengthens your spiritual foundation over time.
            </p>
          </div>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Family-Centered</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Designed for families of all sizes and ages, with adaptable content that grows with your family.
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Bible-Based</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Every plan centers on Scripture reading and application, helping families grow in God's Word together.
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Simple & Practical</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Easy-to-follow plans that fit into busy schedules without compromising spiritual depth.
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Progress Tracking</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Celebrate milestones and maintain consistency with built-in tracking and encouragement features.
          </p>
        </Card>
      </div>

      {/* Credits */}
      <Card className="p-6 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Created with ♥ by
          </h2>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CwickCraft Designs
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Helping families grow closer to God, one worship session at a time.
          </p>
        </div>
      </Card>
    </div>
  );
};
