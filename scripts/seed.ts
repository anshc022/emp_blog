// Adds demo colleagues and sample feedback so you can look at the app locally.
// Run with: npm run seed
//
// Accounts live in TeamDesk, so these people exist only to have feedback addressed to them — none of
// them can sign in. To sign in locally, point TEAMDESK_API_URL at a TeamDesk and use a real account.
import { type Category, createFeedback, db, getUserByTeamDeskId, syncDirectory, toggleStar } from "../src/lib/db";
import { PROMPTS, RATINGS } from "../src/lib/questions";

const people = [
  ["demo-ankita", "Ankita Sharma"],
  ["demo-rahul", "Rahul Verma"],
  ["demo-priya", "Priya Nair"],
  ["demo-arjun", "Arjun Mehta"],
];

syncDirectory(people.map(([id, name]) => ({ id, name, global_role: "MEMBER", is_active: true })));

const emailToDemo: Record<string, string> = {
  "ankita@company.com": "demo-ankita",
  "rahul@company.com": "demo-rahul",
  "priya@company.com": "demo-priya",
  "arjun@company.com": "demo-arjun",
};
const id = (email: string) => getUserByTeamDeskId(emailToDemo[email])!.id;
const { count } = db.prepare("SELECT COUNT(*) AS count FROM feedback").get() as { count: number };

/** A note written the way the composer writes one. */
function note(
  author: string,
  recipient: string | null,
  category: Category,
  stars: Record<string, number>,
  words: Record<string, string>,
) {
  const audience = recipient ? "person" : "company";
  const answers = PROMPTS[audience]
    .filter((p) => words[p.id])
    .map((p) => ({ id: p.id, label: p.label, text: words[p.id] }));
  createFeedback({
    authorId: id(author),
    recipientId: recipient ? id(recipient) : null,
    category,
    message: answers.map((a) => `${a.label}: ${a.text}`).join("\n\n"),
    ratings: RATINGS[audience]
      .filter((r) => stars[r.id])
      .map((r) => ({ id: r.id, label: r.label, value: stars[r.id] })),
    answers,
  });
}

if (count === 0) {
  note("ankita@company.com", null, "Suggestion", { clarity: 4, workload: 2, communication: 3, tools: 3 }, {
    working: "Standups are short and actually useful now.",
    change: "Move the weekly sync to Tuesday mornings. Mondays are already chaos 😵‍💫",
  });
  note("rahul@company.com", "ankita@company.com", "Appreciation", { collaboration: 5, quality: 5, helpfulness: 4 }, {
    keep: "The new onboarding screens are so clean. Customers noticed immediately.",
    better: "Share the Figma a day earlier so backend can shape the API around it.",
  });
  note("priya@company.com", "rahul@company.com", "Concern", { communication: 2, reliability: 3, quality: 4 }, {
    keep: "Your fixes are solid, nothing comes back.",
    better: "Release notes keep landing after launch, so marketing is always catching up. Could they come a few days early? 🙏",
  });
  note("arjun@company.com", null, "Appreciation", { recognition: 5, growth: 4 }, {
    working: "Whoever restocked the good coffee: mornings are healed ☕",
  });

  // A few stars on the company-wide notes.
  const [suggestion, , , coffee] = (
    db.prepare("SELECT id FROM feedback ORDER BY id").all() as { id: number }[]
  ).map((r) => r.id);
  for (const email of ["rahul@company.com", "priya@company.com", "arjun@company.com"]) {
    toggleStar(id(email), suggestion);
  }
  for (const email of ["ankita@company.com", "rahul@company.com"]) toggleStar(id(email), coffee);
}

console.log(`Seeded ${people.length} demo colleagues (they cannot sign in; accounts live in TeamDesk).`);
