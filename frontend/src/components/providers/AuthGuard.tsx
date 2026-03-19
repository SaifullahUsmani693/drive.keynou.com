"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/lib/hooks";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  if (user === null) {
    return null;
  }

  return <>{children}</>;
}
