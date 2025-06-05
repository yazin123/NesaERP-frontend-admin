'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus } from 'lucide-react';
import { projectsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectTeam({ projectId }) {
  const [team, setTeam] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedRole, setSelectedRole] = useState('developer');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeam();
    fetchAvailableMembers();
  }, [projectId]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getProjectMembers(projectId);
      if (response.data) {
        setTeam(response.data);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch team members. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMembers = async () => {
    try {
      const response = await projectsApi.getEmployees();
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
      await projectsApi.addProjectMembers(projectId, {
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
      await projectsApi.removeProjectMember(projectId, memberId);
      toast({
        title: 'Success',
        description: 'Team member removed successfully',
      });
      fetchTeam();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove team member',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await projectsApi.updateMemberRole(projectId, memberId, { role: newRole });
      
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Team</CardTitle>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
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
            {team.map((member) => (
              <div key={member._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.photo} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                </div>
                <Badge>{member.designation}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 