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

export function AdminNav() {
    const router = useRouter();
    const { user } = useAuth();

    // Check if user has admin permissions
    const canManageDepartments = user?.permissions?.includes('manage_departments');
    const canManageDesignations = user?.permissions?.includes('manage_designations');
    const canManageSystemEnums = user?.permissions?.includes('manage_system_enums');
    const canManageUsers = user?.permissions?.includes('manage_users');

    if (!canManageDepartments && !canManageDesignations && !canManageSystemEnums && !canManageUsers) {
        return null;
    }

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Administration</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px]">
                            {canManageUsers && (
                                <ListItem
                                    title="User Management"
                                    href="/employees"
                                >
                                    Manage employees, roles, and permissions.
                                </ListItem>
                            )}
                            {canManageDepartments && (
                                <ListItem
                                    title="Organization Structure"
                                    href="/admin/organization"
                                >
                                    Manage departments and designations within your organization.
                                </ListItem>
                            )}
                            {canManageSystemEnums && (
                                <ListItem
                                    title="System Enums"
                                    href="/admin/enums"
                                >
                                    Configure system-wide enumerations and lookup values.
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