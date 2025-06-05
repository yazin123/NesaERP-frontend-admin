'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { organizationApi } from "@/api";

export default function Designations() {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    level: 1
  });
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [designationsRes, departmentsRes] = await Promise.all([
        organizationApi.getAllDesignations(),
        organizationApi.getAllDepartments()
      ]);

      if (designationsRes.data) {
        setDesignations(designationsRes.data);
      }

      if (departmentsRes.data) {
        setDepartments(departmentsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let response;
      
      if (editingDesignation) {
        response = await organizationApi.updateDesignation(editingDesignation._id, formData);
      } else {
        response = await organizationApi.createDesignation(formData);
      }

      if (response.data) {
        toast({
          title: 'Success',
          description: `Designation ${editingDesignation ? 'updated' : 'created'} successfully`,
        });
        setIsDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving designation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save designation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await organizationApi.deleteDesignation(id);
      toast({
        title: 'Success',
        description: 'Designation deleted successfully',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting designation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete designation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (designation) => {
    setEditingDesignation(designation);
    setFormData({
      name: designation.name,
      description: designation.description,
      department: designation.department._id,
      level: designation.level
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingDesignation(null);
    setFormData({
      name: '',
      description: '',
      department: '',
      level: 1
    });
    setIsDialogOpen(true);
  };

  const levels = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'];
  const departmentOptions = departments.map((dept) => ({
    value: dept._id,
    label: dept.name
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Designations</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Designation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Designation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Title</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={formData.level.toString()}
                  onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">Create Designation</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designations.map((designation) => (
          <Card key={designation._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{designation.name}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(designation)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(designation._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">{designation.department.name}</span>
                <span className="text-sm text-muted-foreground">• {levels[designation.level - 1]}</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {designation.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 