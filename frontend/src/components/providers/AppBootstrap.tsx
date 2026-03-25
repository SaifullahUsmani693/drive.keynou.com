"use client";

import { useEffect, useRef } from "react";

import { accountsApi } from "@/lib/api";
import { useAppDispatch } from "@/lib/hooks";
import { setAuthLoading, setUser } from "@/lib/features/authSlice";

export default function AppBootstrap() {
  const dispatch = useAppDispatch();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;

    let isMounted = true;

    const load = async () => {
      dispatch(setAuthLoading(true));
      try {
        const response = await accountsApi.me();
        if (!isMounted) {
          return;
        }
        dispatch(setUser(response.data?.data ?? null));
      } catch (error) {
        if (!isMounted) {
          return;
        }
        dispatch(setUser(null));
      } finally {
        if (!isMounted) {
          return;
        }
        dispatch(setAuthLoading(false));
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return null;
}
