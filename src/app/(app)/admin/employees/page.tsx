import { ShieldCheck, UserPlus } from "lucide-react";
import { PersonAvatar } from "@/components/avatar";
import { PageHeader } from "@/components/feedback-note";
import { AddEmployeeForm, ResetPasswordForm } from "@/components/forms";
import { toggleActive, toggleRole } from "@/lib/actions";
import { listUsers } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function EmployeesPage() {
  const admin = await requireAdmin();
  const users = listUsers();
  const active = users.filter((u) => u.active).length;

  return (
    <>
      <PageHeader eyebrow="Super admin" title="People">
        {active} active {active === 1 ? "person" : "people"}. Add teammates, reset passwords and choose who can see authors.
      </PageHeader>

      <details className="panel group mb-8 overflow-hidden" open={users.length < 3}>
        <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-ink"><UserPlus size={17} /></span>
          <span className="flex-1 font-semibold">Add a person</span>
          <span className="text-sm text-muted group-open:hidden">Open</span>
        </summary>
        <div className="border-t border-line p-5 sm:p-6"><AddEmployeeForm /></div>
      </details>

      <ul className="panel divide-y divide-line">
        {users.map((u) => {
          const self = u.id === admin.id;
          return (
            <li key={u.id} className={`flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5 ${u.active ? "" : "opacity-55"}`}>
              <PersonAvatar name={u.name} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{u.name}</span>
                  {self && <span className="text-xs text-faint">(you)</span>}
                  {u.role === "admin" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-paper">
                      <ShieldCheck size={11} /> Super admin
                    </span>
                  )}
                  {!u.active && (
                    <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] font-semibold text-muted">Deactivated</span>
                  )}
                </div>
                <div className="truncate text-sm text-muted">
                  {u.email}{u.department ? ` · ${u.department}` : ""}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ResetPasswordForm id={u.id} />
                {!self && (
                  <>
                    <form action={toggleRole}>
                      <input type="hidden" name="id" value={u.id} />
                      <button className="btn-quiet">{u.role === "admin" ? "Remove admin" : "Make admin"}</button>
                    </form>
                    <form action={toggleActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <button className="btn-quiet">{u.active ? "Deactivate" : "Reactivate"}</button>
                    </form>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
