import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export function AdminQuickMenu() {
    const router = useRouter();
    const { user } = useAuth();
    const userRoleLevel = user?.role?.level || 0;

    // Define access levels for different features
    const canManageDepartments = userRoleLevel >= 80;
    const canManageDesignations = userRoleLevel >= 80;
    const canManageSystemEnums = userRoleLevel >= 90;
    const canManageUsers = userRoleLevel >= 70;

    if (!canManageDepartments && !canManageDesignations && !canManageSystemEnums && !canManageUsers) {
        return null;
    }

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Quick Admin Access</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px]">
                            {canManageUsers && (
                                <ListItem
                                    title="User Management"
                                    href="/employees"
                                >
                                    Quick access to manage employees, roles, and permissions.
                                </ListItem>
                            )}
                            {canManageDepartments && (
                                <ListItem
                                    title="Organization Structure"
                                    href="/admin/organization"
                                >
                                    Quick access to manage departments and designations.
                                </ListItem>
                            )}
                            {canManageSystemEnums && (
                                <ListItem
                                    title="System Enums"
                                    href="/admin/enums"
                                >
                                    Quick access to configure system-wide enumerations.
                                </ListItem>
                            )}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}

const ListItem = ({ className, title, children, ...props }) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
}; 