import EmployeeList from '@/components/employees/EmployeeList';
import { Metadata } from 'next';

export const metadata = {
    title: 'Employees | ERP System',
    description: 'Manage employees in the ERP system'
};

export default function EmployeesPage() {
    return <EmployeeList />;
} 