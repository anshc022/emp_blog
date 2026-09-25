import { GiveFeedbackForm } from "@/components/forms";
import { CATEGORIES, listActiveColleagues } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function GivePage() {
  const user = await requireUser();
  const colleagues = listActiveColleagues(user.id).map(({ id, name, department }) => ({ id, name, department }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Give feedback</h1>
        <p className="text-sm text-zinc-500">
          Send feedback to one colleague or to everyone in the company.
        </p>
      </div>
      <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
        🔒 Your name is <strong>never shown</strong> to the person receiving it. Only super admins can see
        who wrote each message, so keep it respectful.
      </div>
      <div className="card">
        <GiveFeedbackForm colleagues={colleagues} categories={CATEGORIES} />
      </div>
    </div>
  );
}
