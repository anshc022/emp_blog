import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms";
import { getCurrentUser } from "@/lib/session";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Feedback Channel</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Share honest feedback with your colleagues. Anonymously.
          </p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-zinc-400">
          No account? Ask your super admin to add you.
        </p>
      </div>
    </main>
  );
}
