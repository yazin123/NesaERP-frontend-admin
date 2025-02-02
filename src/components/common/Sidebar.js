'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ClipboardList,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SidebarItem = ({ icon, text, link, active = false }) => (
  <Link href={`/${link}`}
    className={`
      flex items-center space-x-2 p-2 rounded-md cursor-pointer
      ${active ? 'bg-navy-700 text-white' : 'hover:bg-navy-800 hover:text-white'}
    `}
  >
    {icon}
    <span>{text}</span>
  </Link>
);

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-30 w-64 shadow-2xl bg-white
      transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0
    `}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold">ERP Dashboard</h2>
        <button
          className="md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <SidebarItem 
            icon={<Home />} 
            link="dashboard" 
            text="Dashboard" 
            active={pathname === '/dashboard'} 
          />
          <SidebarItem 
            icon={<ClipboardList />} 
            link="tasks" 
            text="Tasks" 
            active={pathname === '/tasks'} 
          />
          <SidebarItem 
            icon={<BarChart2 />} 
            link="analytics" 
            text="Analytics" 
            active={pathname === '/analytics'} 
          />
          <SidebarItem 
            icon={<Users />} 
            link="leads" 
            text="Leads" 
            active={pathname === '/leads'} 
          />
          <SidebarItem 
            icon={<Settings />} 
            link="users" 
            text="Users" 
            active={pathname === '/users'} 
          />
           <SidebarItem 
            icon={<Settings />} 
            link="projects" 
            text="Projects" 
            active={pathname === '/projects'} 
          />
          <li
            onClick={handleLogout}
            className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-red-500 hover:text-white"
          >
            <LogOut />
            <span>Logout</span>
          </li>
        </ul>
      </nav>
    </div>
  );
}