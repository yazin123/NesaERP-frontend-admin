'use client'
import EmployeeDetails from '@/components/employees/EmployeeDetails';
import { useParams } from 'next/navigation';


export default function EmployeeDetailsPage() {
    const params = useParams();
    return <EmployeeDetails employeeId={params.id} />;
} 