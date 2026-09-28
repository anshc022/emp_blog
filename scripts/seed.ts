// Adds demo colleagues and sample feedback so you can look at the app locally.
// Run with: npm run seed
//
// Accounts live in TeamDesk, so these people exist only to have feedback addressed to them — none of
// them can sign in. To sign in locally, point TEAMDESK_API_URL at a TeamDesk and use a real account.
import { createFeedback, db, getUserByTeamDeskId, syncDirectory, toggleStar } from "../src/lib/db";

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
if (count === 0) {
  createFeedback({
    authorId: id("ankita@company.com"),
    recipientId: null,
    category: "Suggestion",
    message: "can we move the weekly sync to tuesday mornings? mondays are already chaos 😵‍💫",
  });
  createFeedback({
    authorId: id("rahul@company.com"),
    recipientId: id("ankita@company.com"),
    category: "Appreciation",
    message: "the new onboarding screens are actually so clean. customers noticed immediately. W 🙌",
  });
  createFeedback({
    authorId: id("priya@company.com"),
    recipientId: id("rahul@company.com"),
    category: "Concern",
    message: "release notes keep landing after launch, so marketing is always playing catch-up. can we get them a few days early? 🙏",
  });
  createFeedback({
    authorId: id("arjun@company.com"),
    recipientId: null,
    category: "Appreciation",
    message: "shout-out to whoever restocked the good coffee. mornings are healed ☕✨",
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
