import React from 'react';
import { Sidebar } from './_components/sidebar';
import { Navbar } from './_components/navbar';
import { getCurrentAppUser } from '@/lib/auth';

const DashboardLayout = async ({ children }) => {
  const user = await getCurrentAppUser();
  const role = user?.role ?? null;

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar role={role} />
      </div>

      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <Sidebar role={role} />
      </div>

      <main className="md:pl-56 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default DashboardLayout;
