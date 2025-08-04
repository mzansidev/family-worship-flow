
import React from 'react';
import { Heart, Sun } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Family Pulse</h1>
              <p className="text-amber-100 text-sm">Growing together in faith</p>
            </div>
          </div>
          <div className="bg-white/20 p-2 rounded-full">
            <Sun className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};
