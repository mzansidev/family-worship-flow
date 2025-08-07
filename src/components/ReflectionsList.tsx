
import React from 'react';
import { MessageSquare, Calendar, Book, LogIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useReflections } from '@/hooks/useReflections';
import { useAuth } from '@/hooks/useAuth';
import { localStorageUtils } from '@/hooks/useLocalStorage';

export const ReflectionsList: React.FC = () => {
  const { reflections, loading } = useReflections();
  const { user } = useAuth();

  const localReflections = user ? [] : localStorageUtils.getReflections();
  const allReflections = user ? reflections : localReflections;

  if (loading) return <div>Loading reflections...</div>;

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
          Past Reflections
          {!user && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Local Only
            </span>
          )}
        </h3>
        
        {!user && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
              <LogIn className="w-4 h-4 mr-2" />
              Sign in to sync your reflections across devices and never lose them.
            </p>
          </div>
        )}
        
        {allReflections.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No reflections yet. Start adding your thoughts during daily worship!</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {allReflections.slice(0, 10).map((reflection) => (
              <div key={reflection.id} className="border-l-4 border-purple-200 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-300">
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
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Reading: {reflection.daily_worship_entries.bible_reading}
                  </p>
                )}
                
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
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
