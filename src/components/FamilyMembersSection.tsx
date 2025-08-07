
import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

export const FamilyMembersSection: React.FC = () => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('participant');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingRole, setEditingRole] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { members, loading, addMember, updateMember, deleteMember } = useFamilyMembers();
  const { toast } = useToast();

  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive"
      });
      return;
    }

    try {
      await addMember(newMemberName, newMemberRole as any);
      setNewMemberName('');
      setNewMemberRole('participant');
      setShowAddForm(false);
      toast({
        title: "Success",
        description: "Family member added successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add family member",
        variant: "destructive"
      });
    }
  };

  const startEditing = (member: any) => {
    setEditingId(member.id);
    setEditingName(member.name);
    setEditingRole(member.role);
  };

  const handleUpdateMember = async () => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateMember(editingId!, editingName, editingRole as any);
      setEditingId(null);
      toast({
        title: "Success",
        description: "Family member updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update family member",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from your family list?`)) {
      try {
        await deleteMember(id);
        toast({
          title: "Success",
          description: "Family member removed successfully!"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove family member",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) return <div>Loading family members...</div>;

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Family Members
          </h3>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Member
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Family member name"
              />
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="teen">Teen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={handleAddMember} size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button 
                onClick={() => {
                  setShowAddForm(false);
                  setNewMemberName('');
                  setNewMemberRole('participant');
                }} 
                size="sm" 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              {editingId === member.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={editingRole} onValueChange={setEditingRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="teen">Teen</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button onClick={handleUpdateMember} size="sm" variant="ghost">
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => setEditingId(null)} 
                      size="sm" 
                      variant="ghost"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-medium">{member.name}</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {member.role}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      onClick={() => startEditing(member)} 
                      size="sm" 
                      variant="ghost"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteMember(member.id, member.name)} 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {members.length === 0 && (
            <p className="text-gray-500 text-center py-4">No family members added yet</p>
          )}
        </div>
      </div>
    </Card>
  );
};
