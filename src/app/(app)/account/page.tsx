import { LogOut } from "lucide-react";
import { PersonAvatar } from "@/components/avatar";
import { PageHeader } from "@/components/feedback-note";
import { logout } from "@/lib/actions";
import { requireUser } from "@/lib/session";
import { Shades3D, Tilt } from "@/components/three-d";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="you" art={<Tilt><Shades3D size={110} /></Tilt>} />
      <div className="mb-10 flex items-center gap-4 border-b border-line pb-8">
        <PersonAvatar name={user.name} size={52} />
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="truncate text-[15px] text-muted">
            {user.email}
          </div>
        </div>
        <span className="meta">{user.role === "admin" ? "admin 👑" : "employee"}</span>
      </div>
      <h2 className="mb-2 font-semibold">password</h2>
      <p className="max-w-sm text-[15px] text-muted">
        you sign in here with your TeamDesk account, so your password is your TeamDesk password.
        change it in TeamDesk and it changes here too.
      </p>
      <form action={logout} className="mt-12 border-t border-line pt-6">
        <button data-sound="bye" className="btn-ghost !px-4 !py-2 !text-sm"><LogOut size={14} /> log out</button>
      </form>
    </>
  );
}
