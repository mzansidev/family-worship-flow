
import React from 'react';
import { MessageSquare, Calendar, Book } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useReflections } from '@/hooks/useReflections';

export const ReflectionsList: React.FC = () => {
  const { reflections, loading } = useReflections();

  if (loading) return <div>Loading reflections...</div>;

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
          Past Reflections
        </h3>
        
        {reflections.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No reflections yet. Start adding your thoughts during daily worship!</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reflections.slice(0, 10).map((reflection) => (
              <div key={reflection.id} className="border-l-4 border-purple-200 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(reflection.worship_date).toLocaleDateString()}</span>
                  {reflection.bible_verse && (
                    <>
                      <Book className="w-4 h-4 ml-2" />
                      <span className="font-medium">{reflection.bible_verse}</span>
                    </>
                  )}
                </div>
                
                {reflection.daily_worship_entries?.theme && (
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Theme: {reflection.daily_worship_entries.theme}
                  </p>
                )}
                
                {reflection.daily_worship_entries?.bible_reading && (
                  <p className="text-sm text-gray-600 mb-2">
                    Reading: {reflection.daily_worship_entries.bible_reading}
                  </p>
                )}
                
                <p className="text-gray-800 text-sm leading-relaxed">
                  {reflection.reflection_text.length > 200 
                    ? `${reflection.reflection_text.substring(0, 200)}...` 
                    : reflection.reflection_text
                  }
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
