import { AddEmployeeForm, ResetPasswordForm } from "@/components/forms";
import { toggleActive, toggleRole } from "@/lib/actions";
import { listUsers } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function EmployeesPage() {
  const admin = await requireAdmin();
  const users = listUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Employees</h1>
        <p className="text-sm text-zinc-500">Add people, reset passwords, and manage super admins.</p>
      </div>

      <div className="card">
        <h2 className="mb-4 font-medium">Add employee</h2>
        <AddEmployeeForm />
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Password</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((u) => {
              const self = u.id === admin.id;
              return (
                <tr key={u.id} className={u.active ? "" : "opacity-50"}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name}{self && " (you)"}</div>
                    <div className="text-xs text-zinc-500">
                      {u.email}{u.department ? ` · ${u.department}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">{u.role === "admin" ? "Super admin" : "Employee"}</td>
                  <td className="px-4 py-3">{u.active ? "Active" : "Deactivated"}</td>
                  <td className="px-4 py-3"><ResetPasswordForm id={u.id} /></td>
                  <td className="px-4 py-3">
                    {!self && (
                      <div className="flex justify-end gap-2">
                        <form action={toggleRole}>
                          <input type="hidden" name="id" value={u.id} />
                          <button className="btn-ghost whitespace-nowrap">
                            {u.role === "admin" ? "Make employee" : "Make admin"}
                          </button>
                        </form>
                        <form action={toggleActive}>
                          <input type="hidden" name="id" value={u.id} />
                          <button className="btn-ghost">{u.active ? "Deactivate" : "Reactivate"}</button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
