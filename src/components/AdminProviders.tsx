"use client";

import React from "react";
import { ToastProvider } from "@/context/ToastContext";

export default function AdminProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
