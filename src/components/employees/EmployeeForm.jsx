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
import { Card, CardContent } from "@/components/ui/card";
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
import api from '@/api';


const EmployeeForm = ({ employee = null }) => {
    const router = useRouter();
    const isEdit = !!employee;

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: employee?.name || '',
            email: employee?.email || '',
            phone: employee?.phone || '',
            designation: employee?.designation || '',
            role: employee?.role || '',
            department: employee?.department || '',
            position: employee?.position || '',
            joiningDate: employee?.joiningDate ? new Date(employee.joiningDate) : null,
            salary: employee?.salary || '',
            bankDetails: employee?.bankDetails || '',
            skills: employee?.skills || [],
            status: employee?.status || 'active',
            allowedWifiNetworks: employee?.allowedWifiNetworks || [{ ssid: '', macAddress: '' }],
            reportingTo: employee?.reportingTo?._id || ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(true);
    const [error, setError] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [managers, setManagers] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [openSkillsCommand, setOpenSkillsCommand] = useState(false);

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
    }, []);

    const fetchManagers = async () => {
        try {
            const response = await api.getManagers();
            setManagers(response.data);
        } catch (error) {
            console.error('Error fetching managers:', error);
            setError('Failed to load managers');
        } finally {
            setFormLoading(false);
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

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');

            const formData = new FormData();
            
            // Add role if not provided (default to 'employee')
            if (!data.role) {
                data.role = 'employee';
            }

            // Add userId if not editing (for new employees)
            if (!isEdit) {
                // Generate a userId based on name (e.g., john.doe)
                const userId = data.name.toLowerCase()
                    .replace(/[^a-z0-9]/g, ' ')
                    .trim()
                    .replace(/\s+/g, '.');
                formData.append('userId', userId);
                
                // Generate a default password
                formData.append('password', 'Welcome@123'); // This should be changed by the employee on first login
            }

            // Append all form data
            Object.keys(data).forEach(key => {
                if (key === 'joiningDate') {
                    formData.append(key, data[key]?.toISOString() || '');
                } else if (key === 'allowedWifiNetworks' || key === 'skills') {
                    formData.append(key, JSON.stringify(data[key]));
                } else if (key === 'salary') {
                    formData.append(key, Number(data[key]));
                } else {
                    formData.append(key, data[key]);
                }
            });

            // Append files if present
            if (resumeFile) {
                formData.append('resume', resumeFile);
            }

            if (isEdit) {
                await api.updateEmployee(employee._id, formData);
            } else {
                await api.createEmployee(formData);
            }

            router.push('/employees');
        } catch (error) {
            console.error('Error submitting employee:', error);
            setError(error.message || 'Failed to save employee');
        } finally {
            setLoading(false);
        }
    };

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
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <label className="text-sm font-medium">Name</label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        rules={{ required: 'Name is required' }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="Enter full name"
                                                error={errors.name?.message}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
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
                                                error={errors.email?.message}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        rules={{ required: 'Phone number is required' }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="Enter phone number"
                                                error={errors.phone?.message}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Designation</label>
                                    <Controller
                                        name="designation"
                                        control={control}
                                        rules={{ required: 'Designation is required' }}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select designation" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {designationOptions.map(option => (
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

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Position</label>
                                    <Controller
                                        name="position"
                                        control={control}
                                        rules={{ required: 'Position is required' }}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
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
                                </div>

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

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Bank Details</label>
                                    <Controller
                                        name="bankDetails"
                                        control={control}
                                        rules={{ required: 'Bank details are required' }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="Enter bank details"
                                                error={errors.bankDetails?.message}
                                            />
                                        )}
                                    />
                                </div>

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

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Department</label>
                                    <Controller
                                        name="department"
                                        control={control}
                                        rules={{ required: 'Department is required' }}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departmentOptions.map(option => (
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

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Joining Date</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                {watch('joiningDate') ? (
                                                    format(watch('joiningDate'), "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={watch('joiningDate')}
                                                onSelect={(date) => {
                                                    setValue('joiningDate', date);
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

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
                            </div>

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