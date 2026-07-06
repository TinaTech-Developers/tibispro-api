"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  CreditCard,
  Building2,
  Users,
  Settings,
  BarChart3,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const menus = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Organizations",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar({ open, setOpen }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`
        fixed lg:relative
        top-0 left-0
        z-50
        h-screen
        w-72
        bg-slate-900
        border-r border-slate-800
        flex flex-col
        transition-transform duration-300

        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">
          <div>
            <h1 className="text-white text-xl font-bold">TiBizPro</h1>

            <p className="text-xs text-slate-400">Administration Portal</p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-4 px-3">
            Main Menu
          </p>

          <nav className="space-y-2">
            {menus.map((item) => {
              const Icon = item.icon;

              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    transition

                    ${
                      active ?
                        "bg-blue-600 text-white shadow-lg"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <Icon size={20} />

                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>

            <div>
              <p className="font-semibold">Super Admin</p>

              <p className="text-xs text-slate-400">admin@tibizpro.com</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-600
              hover:bg-red-700
              py-3
              transition
            "
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
