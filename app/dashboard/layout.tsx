"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Gift,
  User,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(true);

  const links = [
    { href: "/dashboard/profilo", label: "Profilo", icon: User },
    { href: "/dashboard/vetrina", label: "Vetrina", icon: ShoppingBag },
    { href: "/dashboard/magic-giftcard", label: "Magic Giftcard", icon: Gift },
    { href: "/dashboard/cerca", label: "Cerca", icon: Search },
  ];

  return (
    <main className="min-h-screen flex bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside
        className={`hidden md:flex ${
          open ? "w-64" : "w-16"
        } bg-white shadow-lg p-6 flex-col justify-between transition-all duration-500 ease-in-out`}
      >
        <div>
          <button
            onClick={() => setOpen(!open)}
            className="mb-8 text-gray-600 hover:text-purple-700 transition-transform duration-300"
          >
            {open ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>

          <nav className="space-y-2">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center ${
                    open ? "gap-3 pl-5 pr-3 py-3" : "justify-center py-3 pl-5"
                  } rounded-lg transition-all duration-300 ${
                    isActive
                      ? "text-purple-700 font-semibold"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-purple-600 rounded"></span>
                  )}
                  <Icon size={22} className="min-w-[22px]" />
                  {open && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout se sessione presente */}
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`mt-10 flex items-center ${
              open ? "gap-2 px-3 py-3" : "justify-center py-3"
            } text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-all duration-300 cursor-pointer`}
          >
            <LogOut size={22} />
            {open && <span>Logout</span>}
          </button>
        )}
      </aside>

      {/* Contenuto */}
      <div className="flex-1 p-8 overflow-y-auto transition-all duration-500 ease-in-out">
        {children}
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white shadow-t flex justify-around items-center py-2 md:hidden border-t border-gray-200">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center text-xs transition-colors duration-200 ${
                isActive ? "text-purple-700 font-semibold" : "text-gray-600 hover:text-purple-600"
              }`}
            >
              <Icon size={22} />
              <span className="text-[11px]">{label}</span>
            </Link>
          );
        })}
        {/* Logout nella bottom nav solo se sessione presente */}
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex flex-col items-center text-xs text-gray-600 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut size={22} />
            <span className="text-[11px]">Logout</span>
          </button>
        )}
      </nav>
    </main>
  );
}