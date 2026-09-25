import { PersonAvatar } from "@/components/avatar";
import { PageHeader } from "@/components/feedback-note";
import { ChangePasswordForm } from "@/components/forms";
import { logout } from "@/lib/actions";
import { requireUser } from "@/lib/session";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader eyebrow="Account" title="Your profile" />
      <div className="panel mb-6 flex items-center gap-4 p-5">
        <PersonAvatar name={user.name} size={56} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-semibold">{user.name}</div>
          <div className="truncate text-sm text-muted">
            {user.email}{user.department ? ` · ${user.department}` : ""}
          </div>
        </div>
        {user.role === "admin" && (
          <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">Super admin</span>
        )}
      </div>
      <div className="panel p-5 sm:p-7">
        <h2 className="mb-5 font-display text-xl font-semibold">Change password</h2>
        <ChangePasswordForm />
      </div>
      <form action={logout} className="mt-6 lg:hidden">
        <button className="btn-quiet !px-5 !py-2.5 !text-sm">Log out</button>
      </form>
    </>
  );
}
