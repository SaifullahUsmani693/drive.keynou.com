"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/lib/hooks";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.profile?.is_admin;

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
