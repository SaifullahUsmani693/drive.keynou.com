"use client";

import { useEffect } from "react";

import { accountsApi } from "@/lib/api";
import { useAppDispatch } from "@/lib/hooks";
import { setAuthLoading, setUser } from "@/lib/features/authSlice";

export default function AppBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAuthLoading(true));
    accountsApi
      .me()
      .then((response) => {
        dispatch(setUser(response.data?.data ?? null));
      })
      .catch(() => {
        dispatch(setUser(null));
      });
  }, [dispatch]);

  return null;
}
