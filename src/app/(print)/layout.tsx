"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { LoadingState } from "@/components/feedback/LoadingState";
import { routes } from "@/constants/routes";

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(routes.login);
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-white">
        <LoadingState />
      </main>
    );
  }

  return <main className="min-h-screen bg-white text-slate-900 print:bg-white">{children}</main>;
}
