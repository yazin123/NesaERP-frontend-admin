import EmployeeDetails from '@/components/employees/EmployeeDetails';
import { Metadata } from 'next';
import api from '@/api';

export const metadata = {
    title: 'Employee Details | ERP System',
    description: 'View employee details in the ERP system'
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

export default async function EmployeeDetailsPage({ params }) {
    const employee = await getEmployee(params.id);

    if (!employee) {
        return (
            <div>
                <h1>Employee not found</h1>
                <p>The requested employee could not be found.</p>
            </div>
        );
    }

    return <EmployeeDetails employee={employee} />;
} 