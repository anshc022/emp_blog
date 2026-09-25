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
      <PageHeader tag="👯 the squad" tagColor="var(--lilac)" title="the squad 👯">
        {active} {active === 1 ? "human" : "humans"} in the chat. add people, reset passwords, hand out crowns 👑
      </PageHeader>

      <details className="brut group mb-8" open={users.length < 3}>
        <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
          <span className="grid size-10 place-items-center rounded-xl border-2 border-line bg-lime text-xl">➕</span>
          <span className="flex-1 text-lg font-extrabold">add a human</span>
          <span className="text-xl transition group-open:rotate-180">👇</span>
        </summary>
        <div className="border-t-[2.5px] border-line p-5 sm:p-6"><AddEmployeeForm /></div>
      </details>

      <ul className="space-y-4">
        {users.map((u, i) => {
          const self = u.id === admin.id;
          return (
            <li
              key={u.id}
              className={`pop-in brut flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5 ${u.active ? "" : "opacity-50 grayscale"}`}
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            >
              <PersonAvatar name={u.name} size={46} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-extrabold">{u.name}</span>
                  {self && <span className="tag text-faint">(you)</span>}
                  {u.role === "admin" && <span className="sticker -rotate-3 bg-yellow !py-0 !text-xs">👑 admin</span>}
                  {!u.active && <span className="sticker bg-sunken !py-0 !text-xs !text-text">💤 benched</span>}
                </div>
                <div className="truncate text-sm text-muted">
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
                      <button className="btn-sm">{u.role === "admin" ? "🫳 take crown" : "👑 make admin"}</button>
                    </form>
                    <form action={toggleActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <button className="btn-sm">{u.active ? "💤 bench" : "⚡ revive"}</button>
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
