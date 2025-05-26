import React from 'react';
import {
    Bell,
    Search,
    Settings,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from '@/context/AuthContext';
import { Badge } from "@/components/ui/badge";
import api from '@/api';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = React.useState([]);
    const [showSearch, setShowSearch] = React.useState(false);

    // Get page title from current route
    const getPageTitle = () => {
        const path = pathname.split('/').filter(Boolean);
        if (path.length === 0) return 'Dashboard';
        return path.map(segment => 
            segment.charAt(0).toUpperCase() + segment.slice(1)
        ).join(' / ');
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            logout();
        } catch (error) {
            console.error('Logout error:', error);
            // Still logout the user locally even if the API call fails
            logout();
        }
    };

    // Fetch notifications on mount
    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.getNotifications();
                setNotifications(response.data.filter(n => !n.read));
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <div className="container flex h-14 items-center px-4">
                <div className="mr-4 hidden md:flex">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        {isSidebarOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
                <div className="flex items-center flex-1">
                    <h1 className="text-lg font-semibold hidden md:block">
                        {getPageTitle()}
                    </h1>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden"
                        onClick={toggleSidebar}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`transition-all duration-200 ${showSearch ? 'w-64' : 'w-0'}`}>
                        {showSearch && (
                        <Input
                            placeholder="Search..."
                                className="h-9"
                                autoFocus
                                onBlur={() => setShowSearch(false)}
                        />
                        )}
                </div>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowSearch(!showSearch)}
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {notifications.length > 0 && (
                                    <Badge 
                                        variant="destructive" 
                                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                    >
                                        {notifications.length}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <DropdownMenuItem key={notification.id}>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium">{notification.title}</p>
                                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <ThemeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.department}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/profile')}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </motion.header>
    );
};

export default Header; 