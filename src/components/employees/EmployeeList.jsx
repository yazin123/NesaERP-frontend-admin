'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit,
    Trash2,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    Phone,
    Building,
    Grid,
    List
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from '@/api';
import { useToast } from '@/hooks/use-toast';

const EmployeeList = () => {
    const router = useRouter();
    const { user } = useAuth();
    const toast = useToast();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({
        department: 'all',
        designation: 'all',
        role: 'all',
        position: 'all',
        search: '',
        page: 1,
        limit: 10,
        sortBy: 'name',
        order: 'asc'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('table');

    // Updated options from User model
    const designationOptions = [
        { value: 'fullstack', label: 'Full Stack Developer' },
        { value: 'frontend', label: 'Frontend Developer' },
        { value: 'backend', label: 'Backend Developer' },
        { value: 'designer', label: 'Designer' },
        { value: 'hr', label: 'HR' },
        { value: 'manager', label: 'Manager' }
    ];

    const departmentOptions = [
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'Human Resources' }
    ];

    const roleOptions = [
        { value: 'admin', label: 'Administrator' },
        { value: 'manager', label: 'Manager' },
        { value: 'employee', label: 'Employee' },
        { value: 'intern', label: 'Intern' }
    ];

    const positionOptions = [
        { value: 'senior', label: 'Senior' },
        { value: 'junior', label: 'Junior' },
        { value: 'intern', label: 'Intern' },
        { value: 'lead', label: 'Lead' }
    ];

    useEffect(() => {
        fetchEmployees();
    }, [filters]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            console.log("filters", filters);
            const response = await api.admin.getEmployees(filters);
            if (response) {
                console.log("response", response.data);
                setEmployees(response.data.users || []);
                setTotalCount(response?.data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast({
                title: "Error",
                description: "Failed to fetch employees. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        // If value is 'all', don't include it in the filters
        const newValue = value === 'all' ? '' : value;
        setFilters(prev => ({ ...prev, [field]: newValue, page: 1 }));
    };

    const handleDeleteEmployee = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await api.admin.deleteEmployee(id);
                await fetchEmployees();
                toast({
                    title: "Success",
                    description: "Employee deleted successfully",
                    variant: "default"
                });
            } catch (error) {
                console.error('Error deleting employee:', error);
                toast({
                    title: "Error",
                    description: "Failed to delete employee. Please try again.",
                    variant: "destructive"
                });
            }
        }
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const totalPages = Math.ceil(totalCount / filters.limit);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Employees</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('table')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                    </div>
                    {user?.role === 'admin' && (
                        <Button asChild>
                            <Link href="/employees/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Employee
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search employees..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>

            {showFilters && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                    <Select
                        value={filters.department}
                        onValueChange={(value) => handleFilterChange('department', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departmentOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.designation}
                        onValueChange={(value) => handleFilterChange('designation', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Designation" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Designations</SelectItem>
                            {designationOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.role}
                        onValueChange={(value) => handleFilterChange('role', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {roleOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.position}
                        onValueChange={(value) => handleFilterChange('position', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Position" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Positions</SelectItem>
                            {positionOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </motion.div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : viewMode === 'table' ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Join Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((employee) => (
                                <TableRow key={employee._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={employee.photo} alt={employee.name} />
                                                <AvatarFallback>{employee.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{employee.name}</div>
                                                <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{employee.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{employee.phone}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            <Building className="mr-1 h-3 w-3" />
                                            {employee.department}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge>{employee.designation}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{employee.position}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {employee.joiningDate ? format(new Date(employee.joiningDate), 'PP') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/employees/${employee._id}`}>
                                                        View Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                {user?.role === 'admin' && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/employees/${employee._id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDeleteEmployee(employee._id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map((employee) => (
                        <Card key={employee._id}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-14 w-14">
                                    <AvatarImage src={employee.photo} alt={employee.name} />
                                    <AvatarFallback>{employee.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{employee.name}</CardTitle>
                                    <CardDescription>{employee.employeeId}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{employee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{employee.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span>{employee.department}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge>{employee.designation}</Badge>
                                    <Badge variant="secondary">{employee.position}</Badge>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/employees/${employee._id}`}>
                                            View Profile
                                        </Link>
                                    </Button>
                                    {user?.role === 'admin' && (
                                        <>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/employees/${employee._id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteEmployee(employee._id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(filters.page - 1)}
                                disabled={filters.page === 1}
                            />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i + 1}>
                                <PaginationLink
                                    onClick={() => handlePageChange(i + 1)}
                                    isActive={filters.page === i + 1}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(filters.page + 1)}
                                disabled={filters.page === totalPages}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default EmployeeList; 