'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, Search } from 'lucide-react';
import api from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function CreateProjectDialog({ open, onOpenChange, onProjectCreated }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchingEmployees, setMatchingEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [employees, setEmployees] = useState([]);
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectHead: '',
    techStack: [],
    contacts: [{ name: '', phone: '' }],
    dates: [{ name: '', date: '' }],
    developmentPhases: [{ phasename: '', startdate: '', enddate: '' }]
  });

  // Tech stack input state
  const [newTech, setNewTech] = useState('');

  useEffect(() => {
    if (formData.techStack.length > 0) {
      fetchMatchingEmployees();
    }
  }, [formData.techStack]);

  const fetchMatchingEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const data = await api.getMatchingEmployees(formData.techStack);
      setMatchingEmployees(data);
    } catch (err) {
      console.error('Failed to fetch matching employees:', err);
    } finally {
      setIsLoadingEmployees(false);
    }
  };
  useEffect(() => {
    fetchEmployees();
  }, []);
  const fetchEmployees = async () => {
    const data = await api.getProjectHeads();
    setEmployees(data);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTechStack = (tech) => {
    if (tech && !formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
      setNewTech('');
    }
  };

  const removeTechStack = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', phone: '' }]
    }));
  };

  const updateContact = (index, field, value) => {
    setFormData(prev => {
      const newContacts = [...prev.contacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      return { ...prev, contacts: newContacts };
    });
  };

  const removeContact = (index) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const addProjectDate = () => {
    setFormData(prev => ({
      ...prev,
      dates: [...prev.dates, { name: '', date: '' }]
    }));
  };

  const updateProjectDate = (index, field, value) => {
    setFormData(prev => {
      const newDates = [...prev.dates];
      newDates[index] = { ...newDates[index], [field]: value };
      return { ...prev, dates: newDates };
    });
  };

  const removeProjectDate = (index) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates.filter((_, i) => i !== index)
    }));
  };

  const addDevelopmentPhase = () => {
    setFormData(prev => ({
      ...prev,
      developmentPhases: [...prev.developmentPhases, { phasename: '', startdate: '', enddate: '' }]
    }));
  };

  const updateDevelopmentPhase = (index, field, value) => {
    setFormData(prev => {
      const newPhases = [...prev.developmentPhases];
      newPhases[index] = { ...newPhases[index], [field]: value };
      return { ...prev, developmentPhases: newPhases };
    });
  };

  const removeDevelopmentPhase = (index) => {
    setFormData(prev => ({
      ...prev,
      developmentPhases: prev.developmentPhases.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.name || !formData.description || !formData.projectHead) {
        throw new Error('Please fill in all required fields');
      }

      // Create project data structure
      const projectData = {
        ...formData,
        pipeline: {
          phases: [
            { name: 'Requirement Gathering', status: 'pending' },
            { name: 'Architect Creation', status: 'pending' },
            { name: 'Architect Submission', status: 'pending' },
            ...formData.developmentPhases.map(phase => ({
              name: phase.phasename,
              status: 'pending',
              startDate: phase.startdate,
              endDate: phase.enddate
            }))
          ]
        }
      };

      // Submit to API
      const response = await api.createProject(projectData);

      toast({
        title: 'Success',
        description: 'Project created successfully',
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        projectHead: '',
        techStack: [],
        contacts: [{ name: '', phone: '' }],
        dates: [{ name: '', date: '' }],
        developmentPhases: [{ phasename: '', startdate: '', enddate: '' }]
      });
      
      onProjectCreated?.(response);
      onOpenChange(false);

    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to your organization. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  placeholder="Project name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Project description"
                  className="col-span-3"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Point of Contact */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Point of Contact</h3>
                <Button type="button" variant="outline" size="sm" onClick={addContact}>
                  <Plus className="h-4 w-4 mr-2" />Add Contact
                </Button>
              </div>
              {formData.contacts.map((contact, index) => (
                <div key={index} className="grid grid-cols-8 gap-4 items-center">
                  <Label className="text-right col-span-1">Contact {index + 1}</Label>
                  <Input
                    placeholder="Name"
                    className="col-span-3"
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    className="col-span-3"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="col-span-1"
                    onClick={() => removeContact(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Project Head & Tech Stack */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Team</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectHead" className="text-right">Project Head</Label>
                <Select
                  value={formData.projectHead}
                  onValueChange={(value) => handleInputChange('projectHead', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select project head" />
                  </SelectTrigger>
                  <SelectContent>
                  {employees?.users?.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-3">Tech Stack</Label>
                <div className="col-span-3 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="Add technology"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTechStack(newTech);
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={() => addTechStack(newTech)}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                        {tech}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTechStack(tech)} />
                      </Badge>
                    ))}
                  </div>

                  {/* Matching Employees Section */}
                  {formData.techStack.length > 0 && (
                    <div className="mt-4 border rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Matching Employees
                      </h4>
                      {isLoadingEmployees ? (
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {matchingEmployees.map((employee) => (
                            <div
                              key={employee.id}
                              className="flex items-center justify-between p-2 bg-muted rounded-md"
                            >
                              <div>
                                <p className="text-sm font-medium">{employee.name}</p>
                                <p className="text-xs text-muted-foreground">{employee.designation}</p>
                              </div>
                              <div className="flex gap-2">
                                {employee.skills.map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Project Dates */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Project Dates</h3>
                <Button type="button" variant="outline" size="sm" onClick={addProjectDate}>
                  <Plus className="h-4 w-4 mr-2" />Add Date
                </Button>
              </div>
              {formData.dates.map((projectDate, index) => (
                <div key={index} className="grid grid-cols-8 gap-4 items-center">
                  <Input
                    placeholder="Date Name (e.g., Start Date)"
                    className="col-span-3"
                    value={projectDate.name}
                    onChange={(e) => updateProjectDate(index, 'name', e.target.value)}
                  />
                  <Input
                    type="date"
                    className="col-span-4"
                    value={projectDate.date}
                    onChange={(e) => updateProjectDate(index, 'date', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProjectDate(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Project Pipeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Pipeline</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-4 p-3 bg-muted rounded-lg">
                    <p className="font-medium">Fixed Phases:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Requirement Gathering</li>
                      <li>Architect Creation</li>
                      <li>Architect Submission</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <p className="font-medium">Development Phases</p>
                  <Button type="button" variant="outline" size="sm" onClick={addDevelopmentPhase}>
                    <Plus className="h-4 w-4 mr-2" />Add Phase
                  </Button>
                </div>
                {formData.developmentPhases.map((phase, index) => (
                  <div key={index} className="grid grid-cols-8 gap-4 items-center">
                    <Input
                      placeholder="Phase Name"
                      className="col-span-2"
                      value={phase.phasename}
                      onChange={(e) => updateDevelopmentPhase(index, 'phasename', e.target.value)}
                    />
                    <Input
                      type="date"
                      className="col-span-2"
                      value={phase.startdate}
                      onChange={(e) => updateDevelopmentPhase(index, 'startdate', e.target.value)}
                    />
                    <Input
                      type="date"
                      className="col-span-2"
                      value={phase.enddate}
                      onChange={(e) => updateDevelopmentPhase(index, 'enddate', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="col-span-1"
                      onClick={() => removeDevelopmentPhase(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 