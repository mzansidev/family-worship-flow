
import React, { useState } from 'react';
import { MessageSquare, Save, Edit2, LogIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useReflections } from '@/hooks/useReflections';
import { useAuth } from '@/hooks/useAuth';
import { localStorageUtils } from '@/hooks/useLocalStorage';

interface ReflectionSectionProps {
  date: string;
  dailyEntryId?: string;
  bibleReading?: string;
}

export const ReflectionSection: React.FC<ReflectionSectionProps> = ({
  date,
  dailyEntryId,
  bibleReading
}) => {
  const [reflectionText, setReflectionText] = useState('');
  const [bibleVerse, setBibleVerse] = useState(bibleReading || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { addReflection } = useReflections();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!reflectionText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your reflection",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      if (user) {
        // Save to database for logged-in users - only pass content and date
        await addReflection(reflectionText, date);
      } else {
        // Save locally for guest users
        const reflection = {
          id: `guest-${Date.now()}`,
          reflection_text: reflectionText,
          worship_date: date,
          bible_verse: bibleVerse,
          created_at: new Date().toISOString()
        };
        localStorageUtils.saveReflection(reflection);
      }
      
      toast({
        title: "Success",
        description: user ? "Reflection saved successfully!" : "Reflection saved locally! Sign in to sync across devices."
      });
      
      setReflectionText('');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast({
        title: "Error",
        description: "Failed to save reflection",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
          Personal Reflection
          {!user && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Guest Mode
            </span>
          )}
        </h3>
        
        {!user && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
              <LogIn className="w-4 h-4 mr-2" />
              You're using guest mode. Reflections are saved locally. Sign in to sync across devices.
            </p>
          </div>
        )}
        
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Add Your Reflection
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bible-verse">Bible Verse/Passage</Label>
              <Input
                id="bible-verse"
                value={bibleVerse}
                onChange={(e) => setBibleVerse(e.target.value)}
                placeholder="e.g., John 3:16 or today's reading passage"
              />
            </div>
            
            <div>
              <Label htmlFor="reflection">Your Reflection</Label>
              <Textarea
                id="reflection"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Share your thoughts, insights, or how this passage speaks to you..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Reflection'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setReflectionText('');
                  setBibleVerse(bibleReading || '');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
