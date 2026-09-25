import { ChangePasswordForm } from "@/components/forms";
import { requireUser } from "@/lib/session";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Your account</h1>
        <p className="text-sm text-zinc-500">
          {user.name} · {user.email}
          {user.department ? ` · ${user.department}` : ""}
        </p>
      </div>
      <div className="card">
        <h2 className="mb-4 font-medium">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
