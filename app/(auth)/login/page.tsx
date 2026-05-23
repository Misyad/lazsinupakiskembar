import { redirect } from "next/navigation";
import { LoginPage } from "@/components/login-page";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginRoutePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}
