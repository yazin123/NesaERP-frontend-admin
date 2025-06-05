'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usersApi, organizationApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function CreateEmployee() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joinDate: '',
    address: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  useEffect(() => {
    fetchDepartmentsAndDesignations();
  }, []);

  const fetchDepartmentsAndDesignations = async () => {
    try {
      const [departmentsRes, designationsRes] = await Promise.all([
        organizationApi.getAllDepartments(),
        organizationApi.getAllDesignations()
      ]);

      // Ensure departments is always an array
      if (departmentsRes?.data?.departments) {
        setDepartments(departmentsRes.data.departments);
      } else if (Array.isArray(departmentsRes?.data)) {
        setDepartments(departmentsRes.data);
      } else {
        setDepartments([]);
        console.warn('Departments data is not in expected format:', departmentsRes?.data);
      }

      // Ensure designations is always an array
      if (designationsRes?.data?.designations) {
        setDesignations(designationsRes.data.designations);
      } else if (Array.isArray(designationsRes?.data)) {
        setDesignations(designationsRes.data);
      } else {
        setDesignations([]);
        console.warn('Designations data is not in expected format:', designationsRes?.data);
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await usersApi.createEmployee(formData);
      
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Employee created successfully',
        });
        router.push('/employees');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create employee',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create Employee</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(departments) && departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Designation</Label>
                <Select
                  value={formData.designation}
                  onValueChange={(value) => handleInputChange('designation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(designations) && designations.map((desig) => (
                      <SelectItem key={desig._id} value={desig._id}>
                        {desig.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Join Date</Label>
                <Input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => handleInputChange('joinDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter address"
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                    placeholder="Enter emergency contact name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                    placeholder="Enter relationship"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                    placeholder="Enter emergency contact phone"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
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
                {loading ? 'Creating...' : 'Create Employee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 