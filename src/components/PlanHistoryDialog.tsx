import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlanHistory, PlanHistoryItem } from '@/hooks/usePlanHistory';
import { History, BookOpen, Play, Trash2, Archive, Save } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PlanHistoryDialogProps {
  currentPlan?: any;
  onPlanRestored?: () => void;
}

export const PlanHistoryDialog = ({ currentPlan, onPlanRestored }: PlanHistoryDialogProps) => {
  const { history, loading, savePlanToHistory, restorePlanFromHistory, deletePlanFromHistory, archivePlanInHistory } = usePlanHistory();
  const [open, setOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [planName, setPlanName] = useState('');

  const handleSavePlan = async () => {
    if (!planName.trim() || !currentPlan) return;
    
    await savePlanToHistory(currentPlan, planName.trim());
    setPlanName('');
    setSaveDialogOpen(false);
  };

  const handleRestorePlan = async (historyItem: PlanHistoryItem) => {
    const restored = await restorePlanFromHistory(historyItem);
    if (restored) {
      setOpen(false);
      onPlanRestored?.();
    }
  };

  const formatPlanTitle = (item: PlanHistoryItem) => {
    return item.book_name || item.topic_name || 'Unknown Plan';
  };

  const formatProgressInfo = (item: PlanHistoryItem) => {
    const parts = [];
    if (item.current_week > 1) parts.push(`Week ${item.current_week}`);
    if (item.current_chapter > 1 && item.study_type === 'book') parts.push(`Chapter ${item.current_chapter}`);
    if (item.total_days_completed > 0) parts.push(`${item.total_days_completed} days completed`);
    return parts.join(' • ') || 'Just started';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Plan History
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Plan History
            </DialogTitle>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Manage your saved worship plans and switch between different topics
              </p>
              {currentPlan && (
                <Button 
                  onClick={() => setSaveDialogOpen(true)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Current Plan
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading your plan history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No saved plans yet. Save your current plan to build your history!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {history.map((item) => (
                  <Card key={item.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.plan_name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              {item.study_type === 'book' ? 'Bible Book Study' : 'Topical Study'}
                            </Badge>
                            <span>•</span>
                            <span>{formatPlanTitle(item)}</span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRestorePlan(item)}
                            className="flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Restore
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Archive className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Archive Plan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to archive "{item.plan_name}"? You can still access it later from archived plans.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => archivePlanInHistory(item.id)}>
                                  Archive
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete "{item.plan_name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deletePlanFromHistory(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">Progress</p>
                          <p>{formatProgressInfo(item)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Started</p>
                          <p>{new Date(item.start_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Last Updated</p>
                          <p>{new Date(item.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Type</p>
                          <p className="capitalize">{item.plan_type}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Current Plan Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Plan</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Give your current plan a name to save it to your history
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., Salvation Study - Week 3"
                className="mt-1"
              />
            </div>
            {currentPlan && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>Current Plan:</strong> {currentPlan.book_name || currentPlan.topic_name}</p>
                <p><strong>Progress:</strong> Week {currentPlan.current_week}
                  {currentPlan.study_type === 'book' && `, Chapter ${currentPlan.current_chapter}`}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSavePlan}
                disabled={!planName.trim()}
              >
                Save Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};