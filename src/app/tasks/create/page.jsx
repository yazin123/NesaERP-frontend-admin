import TaskForm from '@/components/tasks/TaskForm';
import { Metadata } from 'next';

export const metadata = {
    title: 'Create Task | ERP System',
    description: 'Create a new task in the ERP system'
};

export default function CreateTaskPage() {
    return <TaskForm />;
} 