import TaskForm from '@/components/tasks/TaskForm';
import { Metadata } from 'next';
import api from '@/api';

export const metadata = {
    title: 'Edit Task | ERP System',
    description: 'Edit an existing task in the ERP system'
};

async function getTask(id) {
    try {
        const response = await api.getTask(id);
        return response.data;
    } catch (error) {
        console.log('Error fetching task:', error);
        return null;
    }
}

export default async function EditTaskPage({ params }) {
    const task = await getTask(params.id);

    if (!task) {
        return (
            <div>
                <h1>Task not found</h1>
                <p>The requested task could not be found.</p>
            </div>
        );
    }

    return <TaskForm task={task} />;
} 