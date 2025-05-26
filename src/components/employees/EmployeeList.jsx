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
    Building
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

const EmployeeList = () => {
    const router = useRouter();
    const { user } = useAuth();
    
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        department: '',
        role: '',
        search: '',
        page: 1,
        rowsPerPage: 10
    });
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    // Department options
    const departmentOptions = [
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'HR' }
    ];

    // Role options
    const roleOptions = [
        { value: 'developer', label: 'Developer' },
        { value: 'designer', label: 'Designer' },
        { value: 'manager', label: 'Manager' },
        { value: 'lead', label: 'Team Lead' },
        { value: 'intern', label: 'Intern' }
    ];

    useEffect(() => {
        fetchEmployees();
    }, [filters]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await api.getEmployees(filters);
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleDeleteEmployee = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await employeeService.deleteEmployee(id);
                fetchEmployees();
            } catch (error) {
                console.error('Error deleting employee:', error);
            }
        }
    };

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.email.toLowerCase().includes(filters.search.toLowerCase())
    );

    const paginatedEmployees = filteredEmployees.slice(
        (filters.page - 1) * filters.rowsPerPage,
        filters.page * filters.rowsPerPage
    );

    const totalPages = Math.ceil(filteredEmployees.length / filters.rowsPerPage);

    const renderTableView = () => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedEmployees.map((employee) => (
                        <TableRow key={employee._id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={employee.avatar} alt={employee.name} />
                                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
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
                                <Badge variant="secondary">{employee.role}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(employee.joinDate), 'PP')}</TableCell>
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
    );

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedEmployees.map((employee) => (
                <Card key={employee._id}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={employee.avatar} alt={employee.name} />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
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
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{employee.role}</Badge>
                            <Badge variant="secondary">
                                Joined {format(new Date(employee.joinDate), 'PP')}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/employees/${employee._id}`}>View Profile</Link>
                            </Button>
                            {user?.role === 'admin' && (
                                <>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/employees/${employee._id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => handleDeleteEmployee(employee._id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Employees</h1>
                {user?.role === 'admin' && (
                    <Button asChild>
                        <Link href="/employees/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Link>
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search employees..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                    >
                        {viewMode === 'table' ? 'Grid View' : 'Table View'}
                    </Button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex gap-4"
                        >
                            <Select
                                value={filters.department}
                                onValueChange={(value) => handleFilterChange('department', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    {departmentOptions.map(option => (
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
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    {roleOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </motion.div>
                    )}
                </AnimatePresence>

                {viewMode === 'table' ? renderTableView() : renderGridView()}

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                                disabled={filters.page === 1}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    onClick={() => handleFilterChange('page', pageNum)}
                                    isActive={filters.page === pageNum}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                                disabled={filters.page === totalPages}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};

export default EmployeeList; 