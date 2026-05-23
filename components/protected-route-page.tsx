import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { InternalApp, type InternalPage } from "@/components/internal-app";

export async function ProtectedRoutePage({ page }: { page: InternalPage }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <InternalApp initialPage={page} initialUser={user} />;
}
