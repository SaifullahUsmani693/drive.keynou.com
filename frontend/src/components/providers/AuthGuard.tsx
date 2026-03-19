"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAppSelector } from "@/lib/hooks";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && user === null) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading || user === null) {
    return null;
  }

  return <>{children}</>;
}
