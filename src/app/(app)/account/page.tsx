import { PersonAvatar } from "@/components/avatar";
import { PageHeader } from "@/components/feedback-note";
import { ChangePasswordForm } from "@/components/forms";
import { logout } from "@/lib/actions";
import { requireUser } from "@/lib/session";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader tag="🪪 you" tagColor="var(--lilac)" title={<>it&apos;s <span className="grad-text">you!</span> 🪞</>} />
      <div className="brut mb-8 flex items-center gap-4 p-5">
        <PersonAvatar name={user.name} size={64} />
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-extrabold">{user.name}</div>
          <div className="truncate text-muted">
            {user.email}
            {user.department ? ` · ${user.department}` : ""}
          </div>
        </div>
        <span className="sticker bg-yellow !px-3 !py-1">{user.role === "admin" ? "👑 super admin" : "✌️ employee"}</span>
      </div>
      <div className="brut p-5 sm:p-7">
        <h2 className="mb-5 text-2xl font-extrabold">change password 🔐</h2>
        <ChangePasswordForm />
      </div>
      <form action={logout} className="mt-8">
        <button data-sound="bye" className="btn-sm !px-5 !py-2.5 !text-sm">log out 👋</button>
      </form>
    </>
  );
}
