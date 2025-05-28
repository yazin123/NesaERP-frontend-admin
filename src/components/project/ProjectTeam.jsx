'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectTeam({ projectId }) {
  const [team, setTeam] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedRole, setSelectedRole] = useState('developer');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeam();
    fetchAvailableMembers();
  }, [projectId]);

  const fetchTeam = async () => {
    try {
      const response = await api.admin.getProjectMembers(projectId);
      if (response?.data?.team) {
        setTeam(response.data.team);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch team members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableMembers = async () => {
    try {
      const response = await api.admin.getEmployees();
      if (response?.data?.data?.users) {
        setAvailableMembers(response.data.data.users);
      }
    } catch (error) {
      console.error('Error fetching available members:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMember) return;

    try {
      await api.admin.addProjectMembers(projectId, {
        members: [{ userId: selectedMember, role: selectedRole }]
      });
      
      toast({
        title: 'Success',
        description: 'Team member added successfully',
      });
      
      fetchTeam();
      setSelectedMember('');
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add team member',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.admin.removeProjectMember(projectId, memberId);
      
      toast({
        title: 'Success',
        description: 'Team member removed successfully',
      });
      
      fetchTeam();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.admin.updateMemberRole(projectId, memberId, { role: newRole });
      
      toast({
        title: 'Success',
        description: 'Member role updated successfully',
      });
      
      fetchTeam();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Team</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4">
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map(member => (
                  <SelectItem key={member._id} value={member._id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="tester">Tester</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleAddMember}>Add Member</Button>
          </div>

          <div className="grid gap-4">
            {team.map(member => (
              <div key={member._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.user?.avatar} />
                    <AvatarFallback>{member.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.user?.name}</div>
                    <div className="text-sm text-muted-foreground">{member.user?.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Select 
                    value={member.role} 
                    onValueChange={(value) => handleRoleChange(member._id, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="tester">Tester</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRemoveMember(member._id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 