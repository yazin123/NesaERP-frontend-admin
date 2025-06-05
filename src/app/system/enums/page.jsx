'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function SystemEnums() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [enums] = useState({
    categories: [
      'Project Status',
      'Task Priority',
      'Employee Status',
      'Department',
      'Role Level'
    ],
    values: [
      {
        id: 1,
        category: 'Project Status',
        key: 'IN_PROGRESS',
        value: 'In Progress',
        description: 'Project is currently being worked on',
        isActive: true
      },
      {
        id: 2,
        category: 'Project Status',
        key: 'COMPLETED',
        value: 'Completed',
        description: 'Project has been completed',
        isActive: true
      },
      {
        id: 3,
        category: 'Task Priority',
        key: 'HIGH',
        value: 'High',
        description: 'Task requires immediate attention',
        isActive: true
      },
      {
        id: 4,
        category: 'Employee Status',
        key: 'ACTIVE',
        value: 'Active',
        description: 'Employee is currently working',
        isActive: true
      }
    ]
  });

  const [newEnum, setNewEnum] = useState({
    category: '',
    key: '',
    value: '',
    description: '',
    isActive: true
  });

  const filteredEnums = enums.values.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch = item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddEnum = (e) => {
    e.preventDefault();
    // TODO: Implement API call to add enum
    console.log('New enum:', newEnum);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Enumerations</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Enum
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Enumeration</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEnum} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newEnum.category}
                  onValueChange={(value) => setNewEnum({ ...newEnum, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={newEnum.key}
                  onChange={(e) => setNewEnum({ ...newEnum, key: e.target.value.toUpperCase() })}
                  placeholder="ENUM_KEY"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={newEnum.value}
                  onChange={(e) => setNewEnum({ ...newEnum, value: e.target.value })}
                  placeholder="Display Value"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newEnum.description}
                  onChange={(e) => setNewEnum({ ...newEnum, description: e.target.value })}
                  placeholder="Brief description"
                  required
                />
              </div>

              <Button type="submit" className="w-full">Add Enumeration</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search enums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {enums.categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnums.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="font-mono">{item.key}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell className="max-w-md">{item.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.isActive ? 'default' : 'secondary'}
                      className={item.isActive ? 'bg-green-500' : 'bg-gray-500'}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 