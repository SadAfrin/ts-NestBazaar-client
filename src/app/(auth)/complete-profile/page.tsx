"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import RoleSelectionModal from "@/components/shared/RoleSelectionModal";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [checkedRole, setCheckedRole] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if ((session.user as any).role) {
      router.replace("/dashboard");
      return;
    }

    setCheckedRole(true);
  }, [isPending, session, router]);

  if (isPending || !checkedRole || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <RoleSelectionModal
      session={{ user: session.user }}
      onComplete={() => router.replace("/dashboard")}
    />
  );
}