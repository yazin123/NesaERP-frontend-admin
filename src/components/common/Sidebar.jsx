import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from '@/context/AuthContext';

const menuItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard'
    },
    {
        title: 'Employee',
        icon: Users,
        items: [
            { title: 'All Employees', href: '/employees' },
            { title: 'Add Employee', href: '/employees/create' },
            { title: 'Teams', href: '/teams' }
        ]
    },
    {
        title: 'Project',
        icon: Briefcase,
        items: [
            { title: 'All Projects', href: '/projects' },
            { title: 'Create Project', href: '/projects/create' },
            { title: 'Kanban Board', href: '/projects/board' }
        ]
    },
    {
        title: 'Task',
        icon: CheckSquare,
        items: [
            { title: 'All Tasks', href: '/tasks' },
            { title: 'Create Task', href: '/tasks/create' },
            { title: 'Task Calendar', href: '/tasks/calendar' }
        ]
    },
    {
        title: 'Reports',
        icon: BarChart,
        href: '/reports'
    },
    {
        title: 'Calendar',
        icon: Calendar,
        href: '/calendar'
    },
    {
        title: 'Messages',
        icon: MessageSquare,
        href: '/messages'
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/settings'
    }
];

const Sidebar = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const { user } = useAuth();

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
        const [isCollapsed, setIsCollapsed] = React.useState(false);
        const isActive = pathname === item.href || 
            (item.items?.some(subItem => pathname === subItem.href));
        const Icon = item.icon;

        // Expand the menu item if it contains the active route
        React.useEffect(() => {
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
                    <CollapsibleTrigger className={cn(
                        "flex items-center w-full p-2 rounded-lg text-sm gap-3 hover:bg-muted/50 transition-colors",
                        isActive && "bg-muted font-medium"
                    )}>
                        <Icon className="h-5 w-5" />
                        <span className="flex-1 text-start">{item.title}</span>
                        <ChevronDown className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isCollapsed && "transform rotate-180"
                        )} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-10 space-y-1 pt-1">
                        {item.items.map((subItem) => (
                            <NavItem key={subItem.href} item={subItem} isNested />
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            );
        }

        return (
            <Link
                href={item.href}
                className={cn(
                    "flex items-center w-full p-2 rounded-lg text-sm gap-3 hover:bg-muted/50 transition-colors",
                    isActive && "bg-muted font-medium",
                    isNested && "py-1.5"
                )}
                onClick={() => {
                    if (window.innerWidth < 768) {
                        onClose?.();
                    }
                }}
            >
                {!isNested && <Icon className="h-5 w-5" />}
                <span>{item.title}</span>
            </Link>
        );
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Mobile overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                    />
                    <motion.aside
                        id="sidebar"
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "fixed left-0 top-14 bottom-0 w-64 border-r bg-background p-4 overflow-y-auto z-50",
                            "scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
                        )}
                    >
                        {/* User info section */}
                        <div className="mb-6 p-2">
                            <h2 className="font-semibold">{user?.name}</h2>
                            <p className="text-sm text-muted-foreground">{user?.department}</p>
                        </div>
                        
                        <nav className="space-y-2">
                            {menuItems.map((item) => (
                                <NavItem key={item.title} item={item} />
                            ))}
                        </nav>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar; 