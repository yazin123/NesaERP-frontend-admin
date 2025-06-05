'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { organizationApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: '',
    permissions: {
      users: [],
      projects: [],
      tasks: [],
      reports: [],
      settings: []
    }
  });
  const [editingRole, setEditingRole] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const permissionModules = {
    users: 'User Management',
    projects: 'Project Management',
    tasks: 'Task Management',
    reports: 'Reports',
    settings: 'System Settings'
  };

  const permissionTypes = ['view', 'create', 'edit', 'delete'];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await organizationApi.getAllRoles();
      
      if (response?.data?.data?.roles) {
        setRoles(response.data.data.roles);
      } else if (Array.isArray(response?.data?.data)) {
        setRoles(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setRoles(response.data);
      } else {
        setRoles([]);
        console.warn('Unexpected roles response format:', response);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch roles. Please try again later.',
        variant: 'destructive',
      });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await organizationApi.updateRole(editingRole._id, formData);
        toast({
          title: 'Success',
          description: 'Role updated successfully',
        });
      } else {
        await organizationApi.createRole(formData);
        toast({
          title: 'Success',
          description: 'Role created successfully',
        });
      }
      setFormData({
        name: '',
        description: '',
        level: '',
        permissions: {
          users: [],
          projects: [],
          tasks: [],
          reports: [],
          settings: []
        }
      });
      setEditingRole(null);
      setIsDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: 'Error',
        description: 'Failed to save role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      level: role.level.toString(),
      permissions: role.permissions
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await organizationApi.deleteRole(id);
      toast({
        title: 'Success',
        description: 'Role deleted successfully',
      });
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePermissionChange = (module, type, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: checked
          ? [...prev.permissions[module], type]
          : prev.permissions[module].filter(p => p !== type)
      }
    }));
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
        <h1 className="text-2xl font-bold">Roles</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingRole(null);
              setFormData({
                name: '',
                description: '',
                level: '',
                permissions: {
                  users: [],
                  projects: [],
                  tasks: [],
                  reports: [],
                  settings: []
                }
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Access Level (1-100)</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-4">
                <Label>Permissions</Label>
                <div className="border rounded-lg p-4">
                  <div className="grid gap-6">
                    {Object.entries(permissionModules).map(([module, title]) => (
                      <div key={module}>
                        <h3 className="font-medium mb-2">{title}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {permissionTypes.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${module}-${type}`}
                                checked={formData.permissions[module].includes(type)}
                                onCheckedChange={(checked) => handlePermissionChange(module, type, checked)}
                              />
                              <Label htmlFor={`${module}-${type}`} className="capitalize">
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                  {editingRole ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{role.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(role)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(role._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
                <div className="text-sm">
                  Access Level: {role.level}
                </div>
                <div className="space-y-2">
                  {Object.entries(role.permissions || {}).map(([module, permissions]) => (
                    Array.isArray(permissions) && permissions.length > 0 && (
                      <div key={module} className="text-sm">
                        <span className="font-medium">{permissionModules[module]}:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="capitalize">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 