"use client";

import { useState } from "react";
import {
  Bell,
  Menu,
  Search,
  ChevronDown,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function Topbar({ open, setOpen }: Props) {
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-10">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden rounded-lg p-2 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>

            <p className="hidden sm:block text-sm text-slate-500">
              Welcome back, Super Admin 👋
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="hidden lg:flex flex-1 justify-center px-10">
          <div className="relative w-full max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search organizations, users..."
              className="
                w-full
                rounded-xl
                border
                border-slate-300
                bg-slate-50
                py-3
                pl-11
                pr-4
                outline-none
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
              "
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative rounded-xl p-2 hover:bg-slate-100">
            <Bell size={21} className="text-slate-700" />

            <span
              className="
                absolute
                top-1
                right-1
                h-2.5
                w-2.5
                rounded-full
                bg-red-500
              "
            />
          </button>

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                hover:bg-slate-100
                p-2
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                  text-white
                  font-bold
                "
              >
                A
              </div>

              <div className="hidden md:block text-left">
                <p className="font-semibold text-slate-800">Super Admin</p>

                <p className="text-xs text-slate-500">Administrator</p>
              </div>

              <ChevronDown
                size={18}
                className="hidden md:block text-slate-500"
              />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  mt-2
                  w-56
                  rounded-xl
                  bg-white
                  shadow-xl
                  border
                  border-slate-200
                  overflow-hidden
                "
              >
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold text-slate-800">Super Admin</p>

                  <p className="text-sm text-slate-500">admin@tibizpro.com</p>
                </div>

                <button
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    hover:bg-slate-50
                  "
                >
                  <User size={18} />
                  Profile
                </button>

                <button
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    hover:bg-slate-50
                  "
                >
                  <Settings size={18} />
                  Settings
                </button>

                <button
                  onClick={logout}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-red-600
                    hover:bg-red-50
                  "
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
