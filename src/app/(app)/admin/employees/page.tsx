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
      <PageHeader title="people">
        {active} {active === 1 ? "human" : "humans"} in the chat. add people, reset passwords, hand out crowns.
      </PageHeader>

      <details className="group mb-10 border-y border-line" open={users.length < 3}>
        <summary data-sound="open" className="flex cursor-pointer list-none items-center py-4 [&::-webkit-details-marker]:hidden">
          <span className="flex-1 font-medium">+ add a person</span>
          <span className="text-faint transition group-open:rotate-45">+</span>
        </summary>
        <div className="pb-6"><AddEmployeeForm /></div>
      </details>

      <ul>
        {users.map((u, i) => {
          const self = u.id === admin.id;
          return (
            <li
              key={u.id}
              className={`fade-up flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line py-4 ${u.active ? "" : "opacity-40"}`}
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <PersonAvatar name={u.name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{u.name}</span>
                  {self && <span className="meta">you</span>}
                  {u.role === "admin" && <span className="meta">👑 admin</span>}
                  {!u.active && <span className="meta">benched</span>}
                </div>
                <div className="truncate text-[13px] text-muted">
                  {u.email}
                  {u.department ? ` · ${u.department}` : ""}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ResetPasswordForm id={u.id} />
                {!self && (
                  <>
                    <form action={toggleRole}>
                      <input type="hidden" name="id" value={u.id} />
                      <button data-sound={u.role === "admin" ? "unstar" : "star"} className="btn-ghost">
                        {u.role === "admin" ? "take crown" : "make admin"}
                      </button>
                    </form>
                    <form action={toggleActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <button data-sound={u.active ? "close" : "success"} className="btn-ghost">
                        {u.active ? "bench" : "revive"}
                      </button>
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
