import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    CheckSquare,
    ChevronDown,
    Settings,
    BarChart,
    Calendar,
    MessageSquare,
    ClipboardList,
    Building2,
    FileSpreadsheet,
    X,
    Star,
    Bell,
    FileText,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const Sidebar = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user?.roleLevel >= 70;

    // Common navigation items
    const commonItems = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'My Tasks',
            href: '/my-tasks',
            icon: CheckSquare,
        },
        {
            title: 'My Projects',
            href: '/my-projects',
            icon: Briefcase,
        },
        {
            title: 'Calendar',
            href: '/calendar',
            icon: Calendar,
        },
        {
            title: 'Daily Reports',
            href: '/daily-reports',
            icon: FileText,
        },
        {
            title: 'Performance',
            href: '/performance',
            icon: Star,
        },
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
        }
    ];

    // Admin navigation items
    const adminItems = [
        {
            title: 'Organization',
            icon: Building2,
            items: [
                { title: 'Departments', href: '/admin/departments' },
                { title: 'Designations', href: '/admin/designations' },
                { title: 'Roles', href: '/admin/roles' }
            ]
        },
        {
            title: 'Users',
            icon: Users,
            items: [
                { title: 'All Users', href: '/employees' },
                { title: 'Add User', href: '/employees/create' },
                { title: 'Performance', href: '/admin/performance' }
            ]
        },
        {
            title: 'Projects',
            icon: Briefcase,
            items: [
                { title: 'All Projects', href: '/projects' },
                { title: 'Create Project', href: '/projects/create' },
                { title: 'Kanban Board', href: '/projects/board' }
            ]
        },
        {
            title: 'Tasks',
            icon: ClipboardList,
            items: [
                { title: 'All Tasks', href: '/tasks' },
                { title: 'Create Task', href: '/tasks/create' },
                { title: 'Task Board', href: '/tasks/board' }
            ]
        },
        {
            title: 'Reports',
            icon: FileSpreadsheet,
            items: [
                { title: 'Project Reports', href: '/reports/projects' },
                { title: 'User Reports', href: '/reports/users' },
                { title: 'Performance Reports', href: '/reports/performance' }
            ]
        },
        {
            title: 'System',
            icon: Settings,
            items: [
                { title: 'System Enums', href: '/admin/enums' },
                { title: 'Monitoring', href: '/admin/monitoring' },
                { title: 'Settings', href: '/admin/settings' }
            ]
        }
    ];

    // Close sidebar on route change for mobile
    useEffect(() => {
        if (window.innerWidth < 768) {
            onClose?.();
        }
    }, [pathname, onClose]);

    // Handle click outside for mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth < 768 && sidebar && !sidebar.contains(event.target)) {
                onClose?.();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const NavItem = ({ item, isNested = false }) => {
        const [isCollapsed, setIsCollapsed] = useState(false);
        const isActive = pathname === item.href || 
            (item.items?.some(subItem => pathname === subItem.href));
        const Icon = item.icon;

        // Expand the menu item if it contains the active route
        useEffect(() => {
            if (isActive && item.items) {
                setIsCollapsed(true);
            }
        }, [isActive, item.items]);

        if (item.items) {
            return (
                <Collapsible
                    open={isCollapsed}
                    onOpenChange={setIsCollapsed}
                    className="w-full"
                >
                    <CollapsibleTrigger className="w-full">
                        <div
                            className={cn(
                                "flex items-center justify-between w-full p-2 rounded-lg text-sm font-medium",
                                isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                                isNested && "pl-10"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {Icon && <Icon className="h-4 w-4" />}
                                <span>{item.title}</span>
                            </div>
                            <ChevronDown
                                className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    isCollapsed && "rotate-180"
                                )}
                            />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4">
                        <AnimatePresence initial={false}>
                            {isCollapsed && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-1"
                                >
                                    {item.items.map((subItem) => (
                                        <NavItem
                                            key={subItem.href}
                                            item={subItem}
                                            isNested={true}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CollapsibleContent>
                </Collapsible>
            );
        }

        return (
            <Link
                href={item.href}
                className={cn(
                    "flex items-center gap-3 p-2 rounded-lg text-sm font-medium",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    isNested && "pl-10"
                )}
            >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.title}</span>
            </Link>
        );
    };

    return (
        <aside
            id="sidebar"
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "md:translate-x-0"
            )}
        >
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Nesa ERP</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-3 py-2">
                    <nav className="flex flex-col gap-1">
                        {/* Common Navigation Items */}
                        {commonItems.map((item) => (
                            <NavItem key={item.href} item={item} />
                        ))}

                        {/* Admin Navigation Items */}
                        {isAdmin && (
                            <>
                                <div className="mt-6 mb-2 px-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                        Admin
                                    </h3>
                                </div>
                                {adminItems.map((item) => (
                                    <NavItem key={item.title} item={item} />
                                ))}
                            </>
                        )}
                    </nav>
                </ScrollArea>
            </div>
        </aside>
    );
};

export default Sidebar; 