'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export function CreateProjectDialog({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectHead: '',
    members: [],
    techStack: [],
    startDate: new Date(),
    endDate: new Date(),
    priority: 'medium',
    status: 'planning',
    developmentPhases: []
  });
  const [users, setUsers] = useState([]);
  const [showMembersCommand, setShowMembersCommand] = useState(false);
  const [showTechStackCommand, setShowTechStackCommand] = useState(false);
  const { toast } = useToast();
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [newPhase, setNewPhase] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  // Fetch users for project head and members selection
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.admin.getAllUsers();
      if (response?.data?.users) {
        setUsers(response.data.users.map(user => ({
          value: user._id,
          label: user.name
        })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.admin.createProject(formData);
      
      if (response?.data?.success) {
        toast({
          title: 'Success',
          description: 'Project created successfully'
        });
        onSuccess?.();
        onOpenChange(false);
        setFormData({
          name: '',
          description: '',
          projectHead: '',
          members: [],
          techStack: [],
          startDate: new Date(),
          endDate: new Date(),
          priority: 'medium',
          status: 'planning',
          developmentPhases: []
        });
      } else {
        throw new Error(response?.data?.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Tech stack options
  const techStackOptions = [
    { value: 'react', label: 'React' },
    { value: 'node', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'django', label: 'Django' },
    { value: 'angular', label: 'Angular' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'java', label: 'Java' },
    { value: 'spring', label: 'Spring' },
    { value: 'dotnet', label: '.NET' },
    { value: 'php', label: 'PHP' },
    { value: 'laravel', label: 'Laravel' },
    { value: 'flutter', label: 'Flutter' },
    { value: 'react-native', label: 'React Native' }
  ];

  const toggleMember = (member) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(member.value)
        ? prev.members.filter(id => id !== member.value)
        : [...prev.members, member.value]
    }));
  };

  const toggleTechStack = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech.value)
        ? prev.techStack.filter(t => t !== tech.value)
        : [...prev.techStack, tech.value]
    }));
  };

  const removeMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(id => id !== memberId)
    }));
  };

  const removeTechStack = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleAddPhase = (e) => {
    e.preventDefault();
    if (!newPhase.name || !newPhase.startDate || !newPhase.endDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all phase fields',
        variant: 'destructive'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      developmentPhases: [...prev.developmentPhases, newPhase]
    }));
    setNewPhase({ name: '', startDate: '', endDate: '' });
    setShowPhaseDialog(false);
  };

  const removePhase = (index) => {
    setFormData(prev => ({
      ...prev,
      developmentPhases: prev.developmentPhases.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter project description"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Project Head</label>
                <Select
                  value={formData.projectHead}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectHead: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project head" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.value} value={user.value}>
                        {user.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Team Members</label>
                <Popover open={showMembersCommand} onOpenChange={setShowMembersCommand}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      Select members
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search members..." />
                      <CommandEmpty>No members found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => (
                          <CommandItem
                            key={user.value}
                            onSelect={() => toggleMember(user)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.members.includes(user.value)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {user.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {formData.members.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.members.map(memberId => {
                      const user = users.find(u => u.value === memberId);
                      return (
                        <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                          {user?.label}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeMember(memberId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tech Stack</label>
              <Popover open={showTechStackCommand} onOpenChange={setShowTechStackCommand}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    Select technologies
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search technologies..." />
                    <CommandEmpty>No technologies found.</CommandEmpty>
                    <CommandGroup>
                      {techStackOptions.map((tech) => (
                        <CommandItem
                          key={tech.value}
                          onSelect={() => toggleTechStack(tech)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.techStack.includes(tech.value)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {tech.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.techStack.map(tech => {
                    const techOption = techStackOptions.find(t => t.value === tech);
                    return (
                      <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                        {techOption?.label}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTechStack(tech)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Development Phases</label>
              <div className="mt-2 space-y-2">
                {formData.developmentPhases.map((phase, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{phase.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(phase.startDate).toLocaleDateString()} →{' '}
                        {new Date(phase.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhase(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPhaseDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Development Phase
                </Button>
              </div>
            </div>
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
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>

        {/* Add Phase Dialog */}
        <Dialog open={showPhaseDialog} onOpenChange={setShowPhaseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Development Phase</DialogTitle>
              <DialogDescription>
                Add a new phase to the project development pipeline.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPhase} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phase Name</label>
                <Input
                  value={newPhase.name}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter phase name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newPhase.startDate}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={newPhase.endDate}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPhaseDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Phase
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
} 