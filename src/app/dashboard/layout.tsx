"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, JSX, ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { FaBars } from "react-icons/fa";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [role, setRole] = useState<string>("buyer");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchRole = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/role?email=${session.user.email}`
        );
        const data = await res.json();
        if (data.success) setRole(data.role);
      } catch (error) {
        console.error("Dashboard navigation identity checking error:", error);
      }
    };
    fetchRole();
  }, [session]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar navigation tracking node */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />

      {/* Main Content Area mapping split panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Dashboard inner micro navigation layout control */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars size={18} />
            </button>
            <div>
              <h2 className="font-black text-gray-800 text-lg">Dashboard</h2>
              <p className="text-xs text-gray-400 capitalize">{role} Account</p>
            </div>
          </div>

          {/* User authentication identity info card segment */}
          <div className="flex items-center gap-3">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-9 h-9 rounded-full object-cover border-2 border-green-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-black shadow-md">
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-black text-gray-700">{session.user?.name}</p>
              <p className="text-xs text-gray-400">{session.user?.email}</p>
            </div>
          </div>
        </header>

        {/* Component layout content rendering element view */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}