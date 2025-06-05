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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { organizationApi } from '@/api';

export default function EnumsPage() {
    const [enums, setEnums] = useState([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newEnum, setNewEnum] = useState({
        name: '',
        description: '',
        module: '',
        type: '',
        values: [{ value: '', label: '', order: 0 }]
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchEnums();
    }, []);

    const fetchEnums = async () => {
        try {
            const response = await organizationApi.getEnums();
                
            setEnums(response.data.data || []);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch enums',
                variant: 'destructive'
            });
        }
    };

    const handleCreateEnum = async () => {
        try {
            await organizationApi.createEnum(newEnum);
            toast({
                title: 'Success',
                description: 'Enum created successfully'
            });
            setIsAddDialogOpen(false);
            fetchEnums();
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create enum',
                variant: 'destructive'
            });
        }
    };

    const addEnumValue = () => {
        setNewEnum(prev => ({
            ...prev,
            values: [...prev.values, { value: '', label: '', order: prev.values.length }]
        }));
    };

    const removeEnumValue = (index) => {
        setNewEnum(prev => ({
            ...prev,
            values: prev.values.filter((_, i) => i !== index)
        }));
    };

    const updateEnumValue = (index, field, value) => {
        setNewEnum(prev => ({
            ...prev,
            values: prev.values.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>System Enums</CardTitle>
                            <CardDescription>Manage system-wide enumerations</CardDescription>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>Add New Enum</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Enum</DialogTitle>
                                    <DialogDescription>
                                        Define a new system enumeration
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newEnum.name}
                                            onChange={(e) => setNewEnum(prev => ({ ...prev, name: e.target.value }))}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="description" className="text-right">
                                            Description
                                        </Label>
                                        <Input
                                            id="description"
                                            value={newEnum.description}
                                            onChange={(e) => setNewEnum(prev => ({ ...prev, description: e.target.value }))}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="module" className="text-right">
                                            Module
                                        </Label>
                                        <Select
                                            value={newEnum.module}
                                            onValueChange={(value) => setNewEnum(prev => ({ ...prev, module: value }))}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select module" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="projects">Projects</SelectItem>
                                                <SelectItem value="tasks">Tasks</SelectItem>
                                                <SelectItem value="users">Users</SelectItem>
                                                <SelectItem value="system">System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="type" className="text-right">
                                            Type
                                        </Label>
                                        <Input
                                            id="type"
                                            value={newEnum.type}
                                            onChange={(e) => setNewEnum(prev => ({ ...prev, type: e.target.value }))}
                                            className="col-span-3"
                                            placeholder="e.g., status, priority, designation"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        <Label className="text-right">Values</Label>
                                        <div className="col-span-3 space-y-4">
                                            <ScrollArea className="h-[200px] border rounded-md p-4">
                                                {newEnum.values.map((value, index) => (
                                                    <div key={index} className="flex items-center gap-2 mb-2">
                                                        <Input
                                                            placeholder="Value"
                                                            value={value.value}
                                                            onChange={(e) => updateEnumValue(index, 'value', e.target.value)}
                                                        />
                                                        <Input
                                                            placeholder="Label"
                                                            value={value.label}
                                                            onChange={(e) => updateEnumValue(index, 'label', e.target.value)}
                                                        />
                                                        <Input
                                                            type="number"
                                                            placeholder="Order"
                                                            value={value.order}
                                                            onChange={(e) => updateEnumValue(index, 'order', parseInt(e.target.value))}
                                                            className="w-20"
                                                        />
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => removeEnumValue(index)}
                                                            disabled={newEnum.values.length === 1}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                ))}
                                            </ScrollArea>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addEnumValue}
                                            >
                                                Add Value
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" onClick={handleCreateEnum}>
                                        Create Enum
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Module</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Values</TableHead>
                                <TableHead>System</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enums?.map((enumItem) => (
                                <TableRow key={enumItem._id}>
                                    <TableCell className="font-medium">{enumItem.name}</TableCell>
                                    <TableCell>{enumItem.module}</TableCell>
                                    <TableCell>{enumItem.type}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {enumItem.values.map((value, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {value.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {enumItem.isSystem ? (
                                            <Badge variant="secondary">System</Badge>
                                        ) : (
                                            <Badge variant="outline">Custom</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mr-2"
                                            disabled={enumItem.isSystem}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={enumItem.isSystem}
                                        >
                                            Delete
                                        </Button>
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