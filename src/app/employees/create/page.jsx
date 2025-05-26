import EmployeeForm from '@/components/employees/EmployeeForm';
import { Metadata } from 'next';

export const metadata = {
    title: 'Create Employee | ERP System',
    description: 'Create a new employee in the ERP system'
};

export default function CreateEmployeePage() {
    return <EmployeeForm />;
} 