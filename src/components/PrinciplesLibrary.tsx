
import React, { useState, useEffect } from 'react';
import { Lightbulb, Users, Heart, Clock, ChevronRight, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePrincipleReads } from '@/hooks/usePrincipleReads';
import { usePrinciplesContent } from '@/hooks/usePrinciplesContent';
import { AdminPrincipleForm } from './AdminPrincipleForm';
import { useToast } from '@/hooks/use-toast';

interface PrincipleContent {
  id: string;
  category_id: string;
  title: string;
  content: string;
  read_time: string;
  is_new: boolean;
}

export const PrinciplesLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<PrincipleContent | null>(null);
  const { profile } = useUserProfile();
  const { readPrinciples, markAsRead, getUnreadCount } = usePrincipleReads();
  const { principlesContent, loading, deletePrinciple, refetch } = usePrinciplesContent();
  const { toast } = useToast();

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Lightbulb,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'engaging-children',
      title: 'Engaging Children',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'building-consistency',
      title: 'Building Consistency',
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'spiritual-growth',
      title: 'Deepening Faith',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
    }
  ];

  const getArticlesForCategory = (categoryId: string) => {
    return principlesContent.filter(article => article.category_id === categoryId);
  };

  const getCategoryStats = (categoryId: string) => {
    const articles = getArticlesForCategory(categoryId);
    const unreadCount = getUnreadCount(articles.map(a => a.id));
    return { total: articles.length, unreadCount };
  };

  const handleReadArticle = async (article: PrincipleContent) => {
    setSelectedArticle(article);
    if (!readPrinciples.has(article.id)) {
      try {
        await markAsRead(article.id);
      } catch (error) {
        console.error('Error marking article as read:', error);
      }
    }
  };

  const handleDeletePrinciple = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deletePrinciple(id);
        toast({
          title: "Success",
          description: "Article deleted successfully!"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete article",
          variant: "destructive"
        });
      }
    }
  };

  const isArticleNew = (article: PrincipleContent) => {
    return !readPrinciples.has(article.id);
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="text-muted-foreground">Loading principles library...</div>
      </div>
    );
  }

  // Show individual article
  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedArticle(null)}
          className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center text-sm font-medium transition-colors"
        >
          ← Back to articles
        </button>
        
        <Card className="border-0 bg-card">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground">{selectedArticle.title}</h1>
              <div className="flex items-center gap-2">
                {isArticleNew(selectedArticle) && (
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-medium">
                    NEW
                  </span>
                )}
                {profile?.role === 'admin' && (
                  <Button
                    onClick={() => handleDeletePrinciple(selectedArticle.id, selectedArticle.title)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-6">{selectedArticle.read_time} read</div>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show articles for selected category
  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    const articles = getArticlesForCategory(selectedCategory);
    
    if (category) {
      return (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center text-sm font-medium transition-colors"
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
            {articles.map((article) => (
              <Card 
                key={article.id} 
                className="hover:shadow-md transition-shadow cursor-pointer bg-card border-border"
                onClick={() => handleReadArticle(article)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                      <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{article.title}</h3>
                        {isArticleNew(article) && (
                          <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-medium">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{article.read_time} read</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile?.role === 'admin' && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePrinciple(article.id, article.title);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }
  }

  // Show categories overview
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Lightbulb className="w-6 h-6 mr-2" />
                Principles Library
              </h2>
              <p className="text-orange-100">Learn how to build meaningful family worship</p>
            </div>
            {profile?.role === 'admin' && (
              <AdminPrincipleForm onSuccess={refetch} />
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const stats = getCategoryStats(category.id);
          
          return (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden bg-card border-border"
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className={`bg-gradient-to-br ${category.color} p-4 text-white relative`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {stats.unreadCount > 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {stats.unreadCount} NEW
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-white/70" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">{category.title}</h3>
                <p className="text-white/90 text-sm">{stats.total} articles</p>
              </div>
              <div className="bg-card p-3">
                <div className="text-muted-foreground text-xs">Tap to explore topics</div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200 dark:border-amber-800">
        <div className="p-4">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">💡 Featured Tip</h3>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            Start small and be consistent. Even 5-10 minutes of daily family worship 
            creates lasting spiritual bonds and memories for your children.
          </p>
        </div>
      </Card>
    </div>
  );
};
