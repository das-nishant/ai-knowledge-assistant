import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F19] text-slate-100">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onToggleMobileMenu={() => setMobileOpen(!mobileOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-[#0B0F19] to-[#111827]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
