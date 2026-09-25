import { PersonAvatar } from "@/components/avatar";
import { PageHeader } from "@/components/feedback-note";
import { ChangePasswordForm } from "@/components/forms";
import { logout } from "@/lib/actions";
import { requireUser } from "@/lib/session";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="you" />
      <div className="mb-10 flex items-center gap-4 border-b border-line pb-8">
        <PersonAvatar name={user.name} size={52} />
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="truncate text-[15px] text-muted">
            {user.email}
            {user.department ? ` · ${user.department}` : ""}
          </div>
        </div>
        <span className="meta">{user.role === "admin" ? "super admin 👑" : "employee"}</span>
      </div>
      <h2 className="mb-4 font-semibold">change password</h2>
      <div className="max-w-sm">
        <ChangePasswordForm />
      </div>
      <form action={logout} className="mt-12 border-t border-line pt-6">
        <button data-sound="bye" className="btn-ghost !px-4 !py-2 !text-sm">log out 👋</button>
      </form>
    </>
  );
}
