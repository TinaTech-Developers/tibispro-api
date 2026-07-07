"use client";

import { useState } from "react";

import Sidebar from "../../admin/(dashboard)/components/Sidebar";
import Topbar from "../../admin/(dashboard)/components/Topbar";
import AdminGuard from "./components/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="h-screen bg-slate-100 overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 z-40 h-screen">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        </div>

        {/* Main Area */}
        <div className="ml-64 flex h-screen flex-col">
          {/* Fixed Topbar */}
          <div className="fixed left-64 right-0 top-0 z-30 h-16">
            <Topbar open={sidebarOpen} setOpen={setSidebarOpen} />
          </div>

          {/* Scrollable Content */}
          <main className=" flex-1 overflow-y-auto md:p-16 p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
