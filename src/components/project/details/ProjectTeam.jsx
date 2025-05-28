'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Mail, Phone, UserPlus } from 'lucide-react';
import api from '@/api';
import { useToast } from '@/hooks/use-toast';
import { AddTeamMemberDialog } from './AddTeamMemberDialog';

export function ProjectTeam({ projectId }) {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTeam();
  }, [projectId]);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const response = await api.admin.getProjectMembers(projectId);
      if (response?.data?.data) {
     
        const teamData = Array.isArray(response.data.data.members) ? response.data.data.members : [];
        setTeam(teamData);
        console.log("teamData", teamData);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch team members. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await api.admin.addProjectMembers(projectId, [userId]);
      toast({
        title: 'Success',
        description: 'Team member added successfully',
      });
      fetchTeam();
    } catch (err) {
      console.error('Error adding member:', err);
      throw new Error('Failed to add team member. Please try again.');
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
    } catch (err) {
      console.error('Error removing member:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove team member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'lead': return 'bg-purple-100 text-purple-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'designer': return 'bg-pink-100 text-pink-800';
      case 'tester': return 'bg-green-100 text-green-800';
      case 'analyst': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTeam = team?.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Project Team</CardTitle>
          <div className="h-9 w-24 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const projectHead = team.find(member => member.role === 'project_head');
  const teamMembers = team.filter(member => member.role !== 'project_head');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Project Team</CardTitle>
        <Button
          onClick={() => setIsAddMemberOpen(true)}
          variant="outline"
          size="sm"
          className="text-sm"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-4">
            {/* Project Head */}
            {projectHead && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={projectHead.avatar} />
                    <AvatarFallback>{projectHead.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{projectHead.name}</h4>
                    <p className="text-sm text-muted-foreground">Project Head</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {projectHead.email && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`mailto:${projectHead.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {projectHead.phone && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`tel:${projectHead.phone}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Team Members */}
            <div className="grid gap-4">
              {filteredTeam.map((member) => (
                member.role !== 'project_head' && (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className={getRoleBadgeColor(member.role)}>
                            {member.role.replace('_', ' ')}
                          </Badge>
                          {member.designation && (
                            <span className="text-sm text-muted-foreground">
                              {member.designation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.email && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`mailto:${member.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {member.phone && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`tel:${member.phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member._id)}
                      >
                        <span className="sr-only">Remove member</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                )
              ))}

              {filteredTeam.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'No team members found matching your search.'
                    : 'No team members added yet.'}
                </div>
              )}
            </div>
          </div>
        </div>

        <AddTeamMemberDialog
          open={isAddMemberOpen}
          onOpenChange={setIsAddMemberOpen}
          onAddMember={handleAddMember}
          existingMembers={team}
        />
      </CardContent>
    </Card>
  );
} 