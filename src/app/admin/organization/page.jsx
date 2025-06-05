'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { organizationApi } from '@/api';

export default function OrganizationPage() {
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
    const [isAddDesignationOpen, setIsAddDesignationOpen] = useState(false);
    const [newDepartment, setNewDepartment] = useState({
        name: '',
        description: '',
        code: ''
    });
    const [newDesignation, setNewDesignation] = useState({
        name: '',
        description: '',
        department: '',
        level: 0
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchDepartments();
        fetchDesignations();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await organizationApi.getDepartments();
            setDepartments(response.data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch departments',
                variant: 'destructive'
            });
        }
    };

    const fetchDesignations = async () => {
        try {
            const response = await organizationApi.getDesignations();
            setDesignations(response.data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch designations',
                variant: 'destructive'
            });
        }
    };

    const handleCreateDepartment = async () => {
        try {
            await organizationApi.createDepartment(newDepartment);
            setIsAddDepartmentOpen(false);
            setNewDepartment({ name: '', description: '', code: '' });
            fetchDepartments();
            toast({
                title: 'Success',
                description: 'Department created successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create department',
                variant: 'destructive'
            });
        }
    };

    const handleCreateDesignation = async () => {
        try {
            await organizationApi.createDesignation(newDesignation);
            setIsAddDesignationOpen(false);
            setNewDesignation({
                name: '',
                description: '',
                department: '',
                level: 0
            });
            fetchDesignations();
            toast({
                title: 'Success',
                description: 'Designation created successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create designation',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteDepartment = async (id) => {
        try {
            await organizationApi.deleteDepartment(id);
            fetchDepartments();
            toast({
                title: 'Success',
                description: 'Department deleted successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete department',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteDesignation = async (id) => {
        try {
            await organizationApi.deleteDesignation(id);
            fetchDesignations();
            toast({
                title: 'Success',
                description: 'Designation deleted successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete designation',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Organization Structure</CardTitle>
                    <CardDescription>Manage departments and designations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="departments">
                        <TabsList>
                            <TabsTrigger value="departments">Departments</TabsTrigger>
                            <TabsTrigger value="designations">Designations</TabsTrigger>
                        </TabsList>

                        <TabsContent value="departments">
                            <div className="flex justify-end mb-4">
                                <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
                                    <DialogTrigger asChild>
                                        <Button>Add Department</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Department</DialogTitle>
                                            <DialogDescription>
                                                Add a new department to the organization
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={newDepartment.name}
                                                    onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="code" className="text-right">
                                                    Code
                                                </Label>
                                                <Input
                                                    id="code"
                                                    value={newDepartment.code}
                                                    onChange={(e) => setNewDepartment(prev => ({ ...prev, code: e.target.value }))}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="description" className="text-right">
                                                    Description
                                                </Label>
                                                <Input
                                                    id="description"
                                                    value={newDepartment.description}
                                                    onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleCreateDepartment}>
                                                Create Department
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.map((dept) => (
                                        <TableRow key={dept._id}>
                                            <TableCell className="font-medium">{dept.name}</TableCell>
                                            <TableCell>{dept.code}</TableCell>
                                            <TableCell>{dept.description}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteDepartment(dept._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="designations">
                            <div className="flex justify-end mb-4">
                                <Dialog open={isAddDesignationOpen} onOpenChange={setIsAddDesignationOpen}>
                                    <DialogTrigger asChild>
                                        <Button>Add Designation</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Designation</DialogTitle>
                                            <DialogDescription>
                                                Add a new designation to the organization
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={newDesignation.name}
                                                    onChange={(e) => setNewDesignation(prev => ({ ...prev, name: e.target.value }))}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="department" className="text-right">
                                                    Department
                                                </Label>
                                                <select
                                                    id="department"
                                                    value={newDesignation.department}
                                                    onChange={(e) => setNewDesignation(prev => ({ ...prev, department: e.target.value }))}
                                                    className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.map((dept) => (
                                                        <option key={dept._id} value={dept._id}>
                                                            {dept.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="level" className="text-right">
                                                    Level
                                                </Label>
                                                <Input
                                                    id="level"
                                                    type="number"
                                                    value={newDesignation.level}
                                                    onChange={(e) => setNewDesignation(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="description" className="text-right">
                                                    Description
                                                </Label>
                                                <Input
                                                    id="description"
                                                    value={newDesignation.description}
                                                    onChange={(e) => setNewDesignation(prev => ({ ...prev, description: e.target.value }))}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleCreateDesignation}>
                                                Create Designation
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {designations.map((desig) => (
                                        <TableRow key={desig._id}>
                                            <TableCell className="font-medium">{desig.name}</TableCell>
                                            <TableCell>
                                                {departments.find(d => d._id === desig.department)?.name}
                                            </TableCell>
                                            <TableCell>{desig.level}</TableCell>
                                            <TableCell>{desig.description}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteDesignation(desig._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
} 