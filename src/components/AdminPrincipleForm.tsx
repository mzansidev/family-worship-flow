
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrincipleFormData {
  title: string;
  content: string;
  category_id: string;
  read_time: string;
}

interface AdminPrincipleFormProps {
  onSuccess: () => void;
}

export const AdminPrincipleForm: React.FC<AdminPrincipleFormProps> = ({ onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<PrincipleFormData>({
    title: '',
    content: '',
    category_id: 'getting-started',
    read_time: '5 min'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'engaging-children', label: 'Engaging Children' },
    { id: 'building-consistency', label: 'Building Consistency' },
    { id: 'spiritual-growth', label: 'Deepening Faith' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('principles_content')
        .insert([{
          ...formData,
          is_new: true
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Principle article created successfully!"
      });

      setFormData({
        title: '',
        content: '',
        category_id: 'getting-started',
        read_time: '5 min'
      });
      setShowForm(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create principle article",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New Article
      </Button>
    );
  }

  return (
    <Card className="border-green-200">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create New Principle Article</h3>
          <Button
            type="button"
            onClick={() => setShowForm(false)}
            variant="ghost"
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Article title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="read_time">Read Time</Label>
          <Input
            id="read_time"
            value={formData.read_time}
            onChange={(e) => setFormData(prev => ({ ...prev, read_time: e.target.value }))}
            placeholder="e.g., 5 min"
          />
        </div>

        <div>
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Article content..."
            rows={10}
            required
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Article'}
          </Button>
          <Button
            type="button"
            onClick={() => setShowForm(false)}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
