"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/lib/hooks";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const isAdmin = Boolean(user?.profile?.is_admin || user?.is_superuser);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
