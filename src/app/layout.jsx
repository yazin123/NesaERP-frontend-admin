'use client'
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from "@/components/theme-provider";
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//     title: 'ERP System',
//     description: 'Modern ERP system for business management',
// };

function RootLayoutContent({ children }) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const isLoginPage = pathname === '/';
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Handle initial sidebar state based on screen size
    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 768);
        };

        // Set initial state
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
        }

    // Don't render layout for login page
    if (isLoginPage) {
        return (
            <main className="min-h-screen bg-background">
                {children}
            </main>
        );
    }

    // Protected layout
    return (
        <div className={`min-h-screen ${inter.className}`}>
                <div className="flex h-screen overflow-hidden">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)} 
                />
                    <div 
                        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
                        isSidebarOpen ? 'md:ml-64' : 'ml-0'
                        }`}
                    >
                    <Header 
                        toggleSidebar={toggleSidebar} 
                        isSidebarOpen={isSidebarOpen}
                    />
                        <main className="flex-1 overflow-auto bg-background p-6">
                            {children}
                        </main>
                    </div>
                </div>
            <Toaster />
        </div>
    );
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <RootLayoutContent>
                            {children}
                        </RootLayoutContent>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
} 