'use client';

import TaskDetails from '@/components/tasks/TaskDetails';

export default function MyTaskDetailPage({ params }) {
  return (
    <div className="p-6">
      <TaskDetails taskId={params.id} isAdmin={false} />
    </div>
  );
} 