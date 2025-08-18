
import React from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, Heart, Info } from 'lucide-react';

export const AboutUs: React.FC<{ }> = () => {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            About Family Pulse
          </h2>
          <p className="mt-2 text-white/90">
            Empowering families to put God at the center of everyday life.
          </p>
        </div>
      </Card>

      {/* Mission */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold flex items-center mb-2">
            <Heart className="w-5 h-5 mr-2 text-pink-600" />
            Our Mission
          </h3>
          <p className="text-muted-foreground">
            Family Pulse’s mission is to empower Christians to have God as the centre of their family through simple daily family worship plans.
          </p>
        </div>
      </Card>

      {/* How to use */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold flex items-center mb-4">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            How to Use This App
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Sign in or create an account to save your family’s progress.</li>
            <li>Start with the Daily Worship Plan for a guided time in Scripture, prayer, and discussion focused on God.</li>
            <li>Use the Weekly Worship Plan to dive deeper into a Bible book or topic together.</li>
            <li>Explore the Principles Library for tips to make family worship meaningful and consistent.</li>
            <li>Track your journey and celebrate milestones on the Dashboard & Profile.</li>
          </ol>
        </div>
      </Card>

      {/* Credits */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Credits</h3>
          <p className="text-muted-foreground">
            Created by <span className="font-semibold">CwickCraft Designs</span>.
          </p>
        </div>
      </Card>
    </div>
  );
};
