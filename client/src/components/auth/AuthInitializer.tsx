"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { checkAuth } from "@/redux/slices/authSlice";

export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return null;
}
