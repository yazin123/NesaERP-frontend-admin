'use client';

import { withAuth } from '@/components/auth/withAuth';
import { MonitoringDashboard } from '@/components/monitoring/MonitoringDashboard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function MonitoringPage() {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="dashboard" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="dashboard">System Monitoring</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <MonitoringDashboard />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationCenter />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default withAuth(MonitoringPage); 