'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export function AddTeamMemberDialog({ open, onOpenChange, onAddMember, existingMembers = [] }) {
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
    }
  }, [open]);

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.admin.getAllUsers();
      if (response?.data?.users) {
        // Filter out users who are already team members
        const existingMemberIds = existingMembers.map(member => member._id);
        const availableUsers = response.data.users.filter(
          user => !existingMemberIds.includes(user._id)
        );
        setAvailableUsers(availableUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch available users',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast({
        title: 'Error',
        description: 'Please select a team member',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await onAddMember(selectedUserId);
      setSelectedUserId('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add team member',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Select a team member to add to the project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map(user => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name} - {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 