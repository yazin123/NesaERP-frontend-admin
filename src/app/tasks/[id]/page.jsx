'use client';

import TaskDetails from '@/components/tasks/TaskDetails';

export default function TaskDetailPage({ params }) {
  return (
    <div className="p-6">
      <TaskDetails taskId={params.id} isAdmin={true} />
    </div>
  );
} 