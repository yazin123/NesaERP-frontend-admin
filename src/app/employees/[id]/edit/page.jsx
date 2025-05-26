import EmployeeForm from '@/components/employees/EmployeeForm';
import { Metadata } from 'next';
import api from '@/api';

export const metadata = {
    title: 'Edit Employee | ERP System',
    description: 'Edit an existing employee in the ERP system'
};

async function getEmployee(id) {
    try {
        const response = await api.getEmployee(id);
        return response.data;
    } catch (error) {
        console.error('Error fetching employee:', error);
        return null;
    }
}

export default async function EditEmployeePage({ params }) {
    const employee = await getEmployee(params.id);

    if (!employee) {
        return (
            <div>
                <h1>Employee not found</h1>
                <p>The requested employee could not be found.</p>
            </div>
        );
    }

    return <EmployeeForm employee={employee} />;
} 