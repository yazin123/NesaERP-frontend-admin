import TaskList from '@/components/tasks/TaskList';
import { Metadata } from 'next';

export const metadata = {
    title: 'Tasks | ERP System',
    description: 'Manage and track all tasks in the ERP system'
};

export default function TasksPage() {
    return <TaskList />;
} 