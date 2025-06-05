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

      // Handle designations response
      if (designationsRes?.data?.data?.designations) {
        setDesignations(designationsRes.data.data.designations);
      } else if (Array.isArray(designationsRes?.data?.data)) {
        setDesignations(designationsRes.data.data);
      } else if (Array.isArray(designationsRes?.data)) {
        setDesignations(designationsRes.data);
      } else {
        setDesignations([]);
        console.warn('Unexpected designations response format:', designationsRes);
      }

      // Handle departments response
      if (departmentsRes?.data?.data?.departments) {
        setDepartments(departmentsRes.data.data.departments);
      } else if (Array.isArray(departmentsRes?.data?.data)) {
        setDepartments(departmentsRes.data.data);
      } else if (Array.isArray(departmentsRes?.data)) {
        setDepartments(departmentsRes.data);
      } else {
        setDepartments([]);
        console.warn('Unexpected departments response format:', departmentsRes);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch data. Please try again later.',
        variant: 'destructive',
      });
      setDesignations([]);
      setDepartments([]);
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

      if (response?.data?.success) {
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
        description: error.response?.data?.message || 'Failed to save designation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await organizationApi.deleteDesignation(id);
      
      if (response?.data?.success) {
        toast({
          title: 'Success',
          description: 'Designation deleted successfully',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting designation:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete designation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (designation) => {
    if (!designation) return;
    
    setEditingDesignation(designation);
    setFormData({
      name: designation.name || '',
      description: designation.description || '',
      department: designation.department?._id || '',
      level: designation.level || 1
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
  const departmentOptions = Array.isArray(departments) ? departments.map((dept) => ({
    value: dept._id,
    label: dept.name
  })) : [];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Designations</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Designation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDesignation ? 'Edit Designation' : 'Create Designation'}
              </DialogTitle>
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
                    {levels.map((level, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
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

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {editingDesignation ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(designations) && designations.map((designation) => (
          <Card key={designation._id} className="relative">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{designation.name}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(designation)}
                  >
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
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>{designation.department?.name || 'No Department'}</span>
                </div>
                <p className="text-sm">{designation.description}</p>
                <div className="text-sm text-muted-foreground">
                  Level: {levels[designation.level - 1] || designation.level}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 