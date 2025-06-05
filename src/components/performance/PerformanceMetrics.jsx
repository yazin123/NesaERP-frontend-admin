'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { monitoringApi } from '@/api';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const timeRanges = {
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    'month': 'This Month',
    'custom': 'Custom Range'
};

export default function PerformanceMetrics({ userId }) {
    const [selectedRange, setSelectedRange] = useState('7days');
    const [customDateRange, setCustomDateRange] = useState({
        from: null,
        to: null
    });
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getDateRange = () => {
        const now = new Date();
        switch (selectedRange) {
            case '7days':
                return {
                    startDate: subDays(now, 7),
                    endDate: now
                };
            case '30days':
                return {
                    startDate: subDays(now, 30),
                    endDate: now
                };
            case 'month':
                return {
                    startDate: startOfMonth(now),
                    endDate: endOfMonth(now)
                };
            case 'custom':
                return {
                    startDate: customDateRange.from,
                    endDate: customDateRange.to
                };
            default:
                return {
                    startDate: subDays(now, 7),
                    endDate: now
                };
        }
    };

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            setError('');
            const { startDate, endDate } = getDateRange();
            
            if (selectedRange === 'custom' && (!startDate || !endDate)) {
                return;
            }

            const data = await monitoringApi.getUserPerformance(userId, {
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd')
            });

            setMetrics(data);
        } catch (err) {
            setError('Failed to load performance metrics');
            console.error('Error fetching metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedRange !== 'custom' || (customDateRange.from && customDateRange.to)) {
            fetchMetrics();
        }
    }, [selectedRange, customDateRange, userId]);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        Loading metrics...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Select value={selectedRange} onValueChange={setSelectedRange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(timeRanges).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedRange === 'custom' && (
                    <div className="flex items-center space-x-2">
                        <Calendar
                            mode="range"
                            selected={customDateRange}
                            onSelect={setCustomDateRange}
                            className="rounded-md border"
                        />
                    </div>
                )}
            </div>

            {metrics && (
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                        <TabsTrigger value="time">Time Tracking</TabsTrigger>
                        <TabsTrigger value="productivity">Productivity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">
                                        Overall Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {metrics.overallScore}%
                                    </div>
                                    <Progress value={metrics.overallScore} className="mt-2" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">
                                        Tasks Completed
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {metrics.tasksCompleted}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">
                                        Average Daily Hours
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {metrics.averageDailyHours}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">
                                        Productivity Score
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {metrics.productivityScore}%
                                    </div>
                                    <Progress value={metrics.productivityScore} className="mt-2" />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="tasks">
                        <Card>
                            <CardHeader>
                                <CardTitle>Task Completion Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics.taskCompletionTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="completed" fill="#4CAF50" name="Completed" />
                                            <Bar dataKey="inProgress" fill="#2196F3" name="In Progress" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="time">
                        <Card>
                            <CardHeader>
                                <CardTitle>Time Tracking</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={metrics.timeTrackingData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="hoursWorked"
                                                stroke="#2196F3"
                                                name="Hours Worked"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="expectedHours"
                                                stroke="#4CAF50"
                                                name="Expected Hours"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="productivity">
                        <Card>
                            <CardHeader>
                                <CardTitle>Productivity Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics.productivityMetrics}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="metric" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="score" fill="#2196F3" name="Score" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
} 