'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { organizationApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    head: ''
  });
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await organizationApi.getAllDepartments();
      if (response.data && Array.isArray(response.data)) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch departments. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await organizationApi.updateDepartment(editingDepartment._id, formData);
        toast({
          title: 'Success',
          description: 'Department updated successfully',
        });
      } else {
        await organizationApi.createDepartment(formData);
        toast({
          title: 'Success',
          description: 'Department created successfully',
        });
      }
      setFormData({ name: '', description: '', head: '' });
      setEditingDepartment(null);
      setIsDialogOpen(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: 'Error',
        description: 'Failed to save department. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      head: department.head?._id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await organizationApi.deleteDepartment(id);
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete department. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingDepartment(null);
              setFormData({ name: '', description: '', head: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
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

              <div className="space-y-2">
                <Label htmlFor="head">Department Head</Label>
                <Input
                  id="head"
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDepartment ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((department) => (
          <Card key={department._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{department.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(department)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(department._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {department.description}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Head: {department.head?.name || 'Not Assigned'}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {department.employeeCount || 0} employees
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 