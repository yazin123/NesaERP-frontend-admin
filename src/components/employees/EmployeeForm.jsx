'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Plus,
    Minus,
    Upload
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { usersApi, organizationApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

const EmployeeForm = ({ employee = null, onSuccess }) => {
    const router = useRouter();
    const isEdit = !!employee;
    const { toast } = useToast();

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: employee?.name || '',
            email: employee?.email || '',
            phone: employee?.phone || '',
            designation: employee?.designation || '',
            role: employee?.role || 'employee',
            department: employee?.department || '',
            position: employee?.position || '',
            dateOfJoining: employee?.dateOfJoining ? new Date(employee.dateOfJoining) : new Date(),
            salary: employee?.salary || '',
            bankDetails: {
                bankName: employee?.bankDetails?.bankName || '',
                accountNumber: employee?.bankDetails?.accountNumber || '',
                ifscCode: employee?.bankDetails?.ifscCode || ''
            },
            skills: employee?.skills || [],
            status: employee?.status || 'active',
            allowedWifiNetworks: employee?.allowedWifiNetworks || [{ ssid: '', macAddress: '' }],
            reportingTo: employee?.reportingTo?._id || '',
            firstName: employee?.firstName || '',
            lastName: employee?.lastName || '',
            joinDate: employee?.joinDate ? employee.joinDate.split('T')[0] : '',
            address: employee?.address || '',
            photo: null,
            resume: null,
            bankDetails: {
                accountName: employee?.bankDetails?.accountName || '',
                branch: employee?.bankDetails?.branch || '',
            },
            emergencyContact: {
                name: employee?.emergencyContact?.name || '',
                relationship: employee?.emergencyContact?.relationship || '',
                phone: employee?.emergencyContact?.phone || ''
            }
        }
    });

    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(true);
    const [error, setError] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [managers, setManagers] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [openSkillsCommand, setOpenSkillsCommand] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);

    // Updated options with proper values from the model
    const roleOptions = [
        { value: 'admin', label: 'Administrator' },
        { value: 'manager', label: 'Manager' },
        { value: 'employee', label: 'Employee' },
        { value: 'intern', label: 'Intern' }
    ];

    const designationOptions = [
        { value: 'fullstack', label: 'Full Stack Developer' },
        { value: 'frontend', label: 'Frontend Developer' },
        { value: 'backend', label: 'Backend Developer' },
        { value: 'designer', label: 'Designer' },
        { value: 'hr', label: 'HR' },
        { value: 'manager', label: 'Manager' }
    ];

    const positionOptions = [
        { value: 'senior', label: 'Senior' },
        { value: 'junior', label: 'Junior' },
        { value: 'intern', label: 'Intern' },
        { value: 'lead', label: 'Lead' }
    ];

    const departmentOptions = [
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'Human Resources' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'on_leave', label: 'On Leave' },
        { value: 'terminated', label: 'Terminated' }
    ];

    const commonSkills = [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
        'Java', 'SQL', 'AWS', 'Docker', 'Kubernetes',
        'UI/UX Design', 'Project Management', 'Agile', 'DevOps'
    ];

    useEffect(() => {
        fetchManagers();
        fetchDepartmentsAndDesignations();
    }, []);

    const fetchManagers = async () => {
        try {
            const response = await usersApi.getEmployees({ role: ['manager', 'admin', 'superadmin'] });
            if (response?.data?.users) {
                setManagers(response.data.users.filter(user => user.status === 'active'));
            } else {
                throw new Error('Failed to fetch managers');
            }
        } catch (error) {
            console.error('Error fetching managers:', error);
            toast({
                title: 'Error',
                description: 'Failed to load managers. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setFormLoading(false);
        }
    };

    const fetchDepartmentsAndDesignations = async () => {
        try {
            const [departmentsRes, designationsRes] = await Promise.all([
                organizationApi.getAllDepartments(),
                organizationApi.getAllDesignations()
            ]);

            if (departmentsRes.data) {
                setDepartments(departmentsRes.data);
            }

            if (designationsRes.data) {
                setDesignations(designationsRes.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch required data. Please try again later.',
                variant: 'destructive',
            });
        }
    };

    const handleFileChange = (event) => {
        setResumeFile(event.target.files[0]);
    };

    const handleAddWifiNetwork = () => {
        const networks = watch('allowedWifiNetworks');
        setValue('allowedWifiNetworks', [...networks, { ssid: '', macAddress: '' }]);
    };

    const handleRemoveWifiNetwork = (index) => {
        const networks = watch('allowedWifiNetworks');
        setValue('allowedWifiNetworks', networks.filter((_, i) => i !== index));
    };

    const handleAddSkill = (skill) => {
        const currentSkills = watch('skills');
        if (!currentSkills.includes(skill)) {
            setValue('skills', [...currentSkills, skill]);
        }
        setSkillInput('');
        setOpenSkillsCommand(false);
    };

    const handleRemoveSkill = (skillToRemove) => {
        const currentSkills = watch('skills');
        setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
    };

    const onSubmit = async (formData) => {
        try {
            setLoading(true);
            setError('');

            console.log('Form Data:', formData); // Debug log

            // Create form data object
            const data = new FormData();

            // Append all form fields
            Object.keys(formData).forEach(key => {
                if (key === 'resume') {
                    // Skip resume as it's handled separately
                    return;
                } else if (key === 'dateOfJoining') {
                    data.append(key, formData[key].toISOString());
                } else if (key === 'bankDetails') {
                    // Handle bank details as a JSON string
                    data.append(key, JSON.stringify(formData[key]));
                } else if (Array.isArray(formData[key]) || typeof formData[key] === 'object') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }

                // Debug log
                console.log(`${key}:`, formData[key]);
            });

            // Handle resume file
            if (resumeFile) {
                data.append('resume', resumeFile);
            }

            // Make API call
            const response = isEdit
                ? await usersApi.updateEmployee(employee._id, data)
                : await usersApi.createEmployee(data);

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: `Employee ${isEdit ? 'updated' : 'created'} successfully`,
                });
                if (onSuccess) onSuccess(response.data);
                router.push('/employees');
            } else {
                throw new Error('Failed to save employee');
            }
        } catch (error) {
            console.error('Error submitting employee:', error);
            setError(error.response?.data?.message || 'Failed to save employee');
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to save employee',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredDesignations = formData.department
        ? designations.filter(d => d.department._id === formData.department)
        : [];

    if (formLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                                <Skeleton className="h-10" />
                                <div className="flex gap-2">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-8 w-24" />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-10" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-20" />
                                    <Skeleton className="h-20" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {isEdit ? 'Edit Employee' : 'Add Employee'}
                    </h1>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{isEdit ? 'Edit Employee' : 'Create Employee'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Display Employee ID if editing */}
                                {isEdit && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-2">
                                            Employee ID
                                        </label>
                                        <div className="text-lg font-semibold text-gray-700">
                                            {employee.employeeId}
                                        </div>
                                    </div>
                                )}

                                {/* Name field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name *</label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        rules={{ required: 'Name is required' }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="Enter full name"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Email field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email *</label>
                                    <Controller
                                        name="email"
                                        control={control}
                                        rules={{
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="Enter email address"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Phone field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone *</label>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        rules={{ required: 'Phone number is required' }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="Enter phone number"
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                                    )}
                                </div>

                                {/* Designation field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Designation *</label>
                                    <Controller
                                        name="designation"
                                        control={control}
                                        rules={{ required: 'Designation is required' }}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className={errors.designation ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select designation" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredDesignations.map(option => (
                                                        <SelectItem
                                                            key={option._id}
                                                            value={option._id}
                                                        >
                                                            {option.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.designation && (
                                        <p className="text-sm text-red-500">{errors.designation.message}</p>
                                    )}
                                </div>

                                {/* Department field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Department *</label>
                                    <Controller
                                        name="department"
                                        control={control}
                                        rules={{ required: 'Department is required' }}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map(option => (
                                                        <SelectItem
                                                            key={option._id}
                                                            value={option._id}
                                                        >
                                                            {option.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.department && (
                                        <p className="text-sm text-red-500">{errors.department.message}</p>
                                    )}
                                </div>

                                {/* Position field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Position *</label>
                                    <Controller
                                        name="position"
                                        control={control}
                                        rules={{ required: 'Position is required' }}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className={errors.position ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {positionOptions.map(option => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.position && (
                                        <p className="text-sm text-red-500">{errors.position.message}</p>
                                    )}
                                </div>

                                {/* Salary field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Salary</label>
                                    <Controller
                                        name="salary"
                                        control={control}
                                        rules={{ 
                                            required: 'Salary is required',
                                            min: {
                                                value: 0,
                                                message: 'Salary must be greater than 0'
                                            }
                                        }}
                                        render={({ field }) => (
                                                <Input
                                                    {...field}
                                                type="number"
                                                placeholder="Enter salary"
                                                error={errors.salary?.message}
                                            />
                                        )}
                                                />
                                </div>

                                {/* Bank Details field */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium">Bank Details</label>
                                    <div className="space-y-2">
                                        <Controller
                                            name="bankDetails.bankName"
                                            control={control}
                                            rules={{ required: 'Bank name is required' }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Bank Name"
                                                    error={errors.bankDetails?.bankName?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            name="bankDetails.accountNumber"
                                            control={control}
                                            rules={{ required: 'Account number is required' }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Account Number"
                                                    error={errors.bankDetails?.accountNumber?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            name="bankDetails.ifscCode"
                                            control={control}
                                            rules={{ required: 'IFSC code is required' }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="IFSC Code"
                                                    error={errors.bankDetails?.ifscCode?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Role field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Controller
                                        name="role"
                                        control={control}
                                        rules={{ required: 'Role is required' }}
                                        render={({ field }) => (
                                                <Select
                                                onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roleOptions.map(option => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                        )}
                                    />
                                </div>

                                {/* Date of Joining field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date of Joining</label>
                                    <Controller
                                        name="dateOfJoining"
                                        control={control}
                                        rules={{ required: 'Date of joining is required' }}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                </div>

                                {/* Status field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Controller
                                        name="status"
                                        control={control}
                                        rules={{ required: 'Status is required' }}
                                        render={({ field }) => (
                                                <Select
                                                onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map(option => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                        )}
                                    />
                                </div>

                                {/* Reporting To field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Reporting To</label>
                                    <Controller
                                        name="reportingTo"
                                        control={control}
                                        render={({ field }) => (
                                                <Select
                                                onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select manager" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {managers.map(manager => (
                                                            <SelectItem
                                                                key={manager._id}
                                                                value={manager._id}
                                                            >
                                                                {manager.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                        )}
                                    />
                                </div>

                                {/* Skills field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Skills</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-1">
                                            <Input
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onFocus={() => setOpenSkillsCommand(true)}
                                                placeholder="Add skills"
                                            />
                                            {openSkillsCommand && (
                                                <div className="absolute top-full left-0 w-full z-10">
                                                    <Command>
                                                        <CommandInput placeholder="Search skills..." />
                                                        <CommandEmpty>No skills found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {commonSkills
                                                                .filter(skill => 
                                                                    skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                                                                    !watch('skills').includes(skill)
                                                                )
                                                                .map(skill => (
                                                                    <CommandItem
                                                                        key={skill}
                                                                        onSelect={() => handleAddSkill(skill)}
                                                                    >
                                                                        {skill}
                                                                    </CommandItem>
                                                                ))
                                                            }
                                                        </CommandGroup>
                                                    </Command>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                if (skillInput && !watch('skills').includes(skillInput)) {
                                                    handleAddSkill(skillInput);
                                                }
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                    {watch('skills').length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {watch('skills').map((skill) => (
                                                <Badge
                                                    key={skill}
                                                    variant="secondary"
                                                    className="flex items-center gap-2"
                                                >
                                                    {skill}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 p-0"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Resume field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Resume</label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="flex-1"
                                            accept=".pdf,.doc,.docx"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.querySelector('input[type="file"]').click()}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload
                                        </Button>
                                    </div>
                                    {resumeFile && (
                                        <p className="text-sm text-muted-foreground">
                                            Selected file: {resumeFile.name}
                                        </p>
                                    )}
                                </div>

                                {/* Allowed WiFi Networks field */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Allowed WiFi Networks</label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddWifiNetwork}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Network
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {watch('allowedWifiNetworks').map((_, index) => (
                                            <div key={index} className="flex items-start gap-4">
                                                <div className="flex-1 space-y-4">
                                                    <Controller
                                                        name={`allowedWifiNetworks.${index}.ssid`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                placeholder="SSID"
                                                            />
                                                        )}
                                                    />
                                                    <Controller
                                                        name={`allowedWifiNetworks.${index}.macAddress`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                placeholder="MAC Address"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {index > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="mt-2"
                                                        onClick={() => handleRemoveWifiNetwork(index)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">First Name</label>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{ required: 'First name is required' }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter first name"
                                            className={errors.firstName ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Last Name</label>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{ required: 'Last name is required' }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter last name"
                                            className={errors.lastName ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Join Date</label>
                                <Controller
                                    name="joinDate"
                                    control={control}
                                    rules={{ required: 'Join date is required' }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="date"
                                            className={errors.joinDate ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.joinDate && (
                                    <p className="text-sm text-red-500">{errors.joinDate.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <Controller
                                    name="address"
                                    control={control}
                                    rules={{ required: 'Address is required' }}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            placeholder="Enter address"
                                            className={errors.address ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                    )}
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500">{errors.address.message}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Bank Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Account Name</label>
                                        <Controller
                                            name="bankDetails.accountName"
                                            control={control}
                                            rules={{ required: 'Account name is required' }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Enter account name"
                                                    error={errors.bankDetails?.accountName?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Branch</label>
                                        <Controller
                                            name="bankDetails.branch"
                                            control={control}
                                            rules={{ required: 'Branch is required' }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Enter branch"
                                                    error={errors.bankDetails?.branch?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Emergency Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <Controller
                                            name="emergencyContact.name"
                                            control={control}
                                            rules={{ required: 'Emergency contact name is required' }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Enter emergency contact name"
                                                    error={errors.emergencyContact?.name?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Relationship</label>
                                        <Controller
                                            name="emergencyContact.relationship"
                                            control={control}
                                            rules={{ required: 'Emergency contact relationship is required' }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Enter emergency contact relationship"
                                                    error={errors.emergencyContact?.relationship?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone</label>
                                        <Controller
                                            name="emergencyContact.phone"
                                            control={control}
                                            rules={{ required: 'Emergency contact phone is required' }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Enter emergency contact phone"
                                                    error={errors.emergencyContact?.phone?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? 'Saving...' : 'Save Employee'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default EmployeeForm; 