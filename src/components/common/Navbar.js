// src/components/Navbar.js
'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar({ setIsSidebarOpen }) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      <button 
        className="md:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>
      <h1 className="text-xl font-semibold text-navy-900"></h1>
      <div className="flex items-center space-x-4">
        <div className="bg-navy-100 text-navy-900 px-3 py-1 rounded-full">
          {user?.name || 'User'}
        </div>
      </div>
    </header>
  );
}