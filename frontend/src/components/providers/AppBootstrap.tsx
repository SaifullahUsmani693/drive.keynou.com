"use client";

import { useEffect } from "react";

import { accountsApi } from "@/lib/api";
import { useAppDispatch } from "@/lib/hooks";
import { setUser } from "@/lib/features/authSlice";

export default function AppBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
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
