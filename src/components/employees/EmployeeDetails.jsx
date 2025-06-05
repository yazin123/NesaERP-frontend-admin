'use client'
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
    User,
    Mail,
    Phone,
    Building,
    Calendar,
    Briefcase,
    GraduationCap,
    MapPin,
    CreditCard,
    FileText,
    Edit,
    Download,
    Save,
    X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from '@/api';
import usersApi from '@/api/users';

const EmployeeDetails = ({ employeeId }) => {
    const { user } = useAuth();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);

    // Options for dropdowns
    const departmentOptions = [
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'Human Resources' }
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

    const canEdit = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'manager';

    useEffect(() => {
        fetchEmployeeDetails();
    }, [employeeId]);

    const fetchEmployeeDetails = async () => {
        try {
            setLoading(true);
            const response = await usersApi.getEmployeeById(employeeId);
            setEmployee(response.data);
            setEditedData(response.data); // Initialize edited data with current data
            setError(null);
        } catch (error) {
            console.error('Error fetching employee details:', error);
            setError('Failed to load employee details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedInputChange = (parent, field, value) => {
        setEditedData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const formData = new FormData();

            // Only send fields that have changed
            Object.keys(editedData).forEach(key => {
                // Skip internal fields and files
                if (['_id', '__v', 'photo', 'resume'].includes(key)) {
                    return;
                }

                // Skip if value hasn't changed
                if (JSON.stringify(employee[key]) === JSON.stringify(editedData[key])) {
                    return;
                }

                // Handle different types of data
                if (typeof editedData[key] === 'object' && editedData[key] !== null) {
                    formData.append(key, JSON.stringify(editedData[key]));
                } else if (editedData[key] !== null && editedData[key] !== undefined) {
                    formData.append(key, editedData[key].toString());
                }
            });

            // Add type field to ensure proper handling
            formData.append('type', 'employee');

            const response = await api.admin.updateUser(employeeId, formData);
            
            if (response?.data) {
                // Update the local employee state with the response data
                setEmployee(response.data);
                // Reset edited data to match the new employee data
                setEditedData(response.data);
                setIsEditing(false);
                toast.success('Employee details updated successfully');
            } else {
                throw new Error('Failed to update employee details');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update employee details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditedData(employee);
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={fetchEmployeeDetails} className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="p-6 text-center">
                <p>Employee not found</p>
            </div>
        );
    }

    const data = isEditing ? editedData : employee;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={data.photo} alt={data.name} />
                        <AvatarFallback>{data?.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        {isEditing ? (
                            <Input
                                value={data.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="text-2xl font-bold mb-2"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold">{data.name}</h1>
                        )}
                        <p className="text-muted-foreground">{data.employeeId}</p>
                        <div className="flex gap-2 mt-2">
                            {isEditing ? (
                                <>
                                    <Select
                                        value={data.designation}
                                        onValueChange={(value) => handleInputChange('designation', value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {designationOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={data.department}
                                        onValueChange={(value) => handleInputChange('department', value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departmentOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={data.position}
                                        onValueChange={(value) => handleInputChange('position', value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positionOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </>
                            ) : (
                                <>
                                    <Badge>{data.designation}</Badge>
                                    <Badge variant="outline">{data.department}</Badge>
                                    <Badge variant="secondary">{data.position}</Badge>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {canEdit && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button onClick={handleSave} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </Button>
                                <Button variant="outline" onClick={handleCancel} className="gap-2">
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)} className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="employment">Employment</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            value={data.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                        />
                                    ) : (
                                        <span>{data.email}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            value={data.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                        />
                                    ) : (
                                        <span>{data.phone}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            value={data.address || ''}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            placeholder="Enter address"
                                        />
                                    ) : (
                                        <span>{data.address || 'Not provided'}</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Work Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span>Department: {data.department}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span>Position: {data.position}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Joined: {format(new Date(data.dateOfJoining), 'PP')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {data.skills?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <Input
                                        value={data.skills.join(', ')}
                                        onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()))}
                                        placeholder="Enter skills (comma-separated)"
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {data.skills.map((skill, index) => (
                                            <Badge key={index} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="personal" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Date of Birth</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input
                                                    type="date"
                                                    value={data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                />
                                            ) : (
                                                data.dateOfBirth ? format(new Date(data.dateOfBirth), 'PP') : 'Not provided'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Gender</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Select
                                                    value={data.gender || ''}
                                                    onValueChange={(value) => handleInputChange('gender', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                data.gender || 'Not provided'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Marital Status</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Select
                                                    value={data.maritalStatus || ''}
                                                    onValueChange={(value) => handleInputChange('maritalStatus', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select marital status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single</SelectItem>
                                                        <SelectItem value="married">Married</SelectItem>
                                                        <SelectItem value="divorced">Divorced</SelectItem>
                                                        <SelectItem value="widowed">Widowed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                data.maritalStatus || 'Not provided'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Blood Group</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Select
                                                    value={data.bloodGroup || ''}
                                                    onValueChange={(value) => handleInputChange('bloodGroup', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select blood group" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => (
                                                            <SelectItem key={group} value={group}>{group}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                data.bloodGroup || 'Not provided'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Name</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input
                                                    value={data.emergencyContact?.name || ''}
                                                    onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                                                    placeholder="Enter emergency contact name"
                                                />
                                            ) : (
                                                data.emergencyContact?.name || 'Not provided'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Relationship</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input
                                                    value={data.emergencyContact?.relationship || ''}
                                                    onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                                                    placeholder="Enter relationship"
                                                />
                                            ) : (
                                                data.emergencyContact?.relationship || 'Not provided'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Phone</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input
                                                    value={data.emergencyContact?.phone || ''}
                                                    onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                                                    placeholder="Enter emergency contact phone"
                                                />
                                            ) : (
                                                data.emergencyContact?.phone || 'Not provided'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="employment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employment Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Employee ID</TableCell>
                                        <TableCell>{data.employeeId}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Date of Joining</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input
                                                    type="date"
                                                    value={new Date(data.dateOfJoining).toISOString().split('T')[0]}
                                                    onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                                                />
                                            ) : (
                                                format(new Date(data.dateOfJoining), 'PP')
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Department</TableCell>
                                        <TableCell>{data.department}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Designation</TableCell>
                                        <TableCell>{data.designation}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Position</TableCell>
                                        <TableCell>{data.position}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Reporting To</TableCell>
                                        <TableCell>{data.reportingTo?.name || 'Not assigned'}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {canEdit && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Salary & Bank Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Basic Salary</TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        value={data.salary || ''}
                                                        onChange={(e) => handleInputChange('salary', parseFloat(e.target.value))}
                                                        placeholder="Enter salary"
                                                    />
                                                ) : (
                                                    data.salary ? `$${data.salary.toFixed(2)}` : 'Not set'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Bank Name</TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <Input
                                                        value={data.bankDetails?.bankName || ''}
                                                        onChange={(e) => handleNestedInputChange('bankDetails', 'bankName', e.target.value)}
                                                        placeholder="Enter bank name"
                                                    />
                                                ) : (
                                                    data.bankDetails?.bankName || 'Not provided'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Account Number</TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <Input
                                                        value={data.bankDetails?.accountNumber || ''}
                                                        onChange={(e) => handleNestedInputChange('bankDetails', 'accountNumber', e.target.value)}
                                                        placeholder="Enter account number"
                                                    />
                                                ) : (
                                                    data.bankDetails?.accountNumber || 'Not provided'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">IFSC Code</TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <Input
                                                        value={data.bankDetails?.ifscCode || ''}
                                                        onChange={(e) => handleNestedInputChange('bankDetails', 'ifscCode', e.target.value)}
                                                        placeholder="Enter IFSC code"
                                                    />
                                                ) : (
                                                    data.bankDetails?.ifscCode || 'Not provided'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>Employee documents and files</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.resume && (
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Resume</p>
                                            <p className="text-sm text-muted-foreground">
                                                Uploaded on {data.resume.uploadDate ? format(new Date(data.resume.uploadDate), 'PP') : 'Unknown date'}
                                            </p>
                                        </div>
                                    </div>
                                    {data.resume.fileUrl && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/api/uploads/${data.resume.fileUrl}`} target="_blank">
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}

                            {isEditing && (
                                <div className="mt-4">
                                    <Input
                                        type="file"
                                        onChange={(e) => handleInputChange('resume', e.target.files[0])}
                                        accept=".pdf,.doc,.docx"
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Accepted formats: PDF, DOC, DOCX
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default EmployeeDetails; 