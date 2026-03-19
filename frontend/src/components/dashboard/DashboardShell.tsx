"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

import { accountsApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser } from "@/lib/features/authSlice";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await accountsApi.logout();
    dispatch(setUser(null));
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            Keynou Drive
          </Link>
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <Link href="/dashboard">Dashboard</Link>
            {user?.profile?.is_admin ? (
              <Link href="/admin" className="inline-flex items-center gap-2 text-emerald-200">
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            ) : null}
          </nav>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 hover:border-white/40"
          >
            <LogOut className="h-3 w-3" /> Logout
          </button>
         </div>
       </header>
       <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
     </div>
   );
 }
