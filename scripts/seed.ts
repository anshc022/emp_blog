// Adds demo employees and sample feedback so you can try the app locally.
// Run with: npm run seed
import bcrypt from "bcryptjs";
import { createFeedback, db, getUserWithHash, toggleStar } from "../src/lib/db";

const password = bcrypt.hashSync("password123", 10);
const people = [
  ["Ankita Sharma", "ankita@company.com", "Design"],
  ["Rahul Verma", "rahul@company.com", "Engineering"],
  ["Priya Nair", "priya@company.com", "Marketing"],
  ["Arjun Mehta", "arjun@company.com", "Sales"],
];

for (const [name, email, department] of people) {
  db.prepare(
    "INSERT OR IGNORE INTO users (name, email, password_hash, department) VALUES (?, ?, ?, ?)",
  ).run(name, email, password, department);
}

const id = (email: string) => getUserWithHash(email)!.id;
const { count } = db.prepare("SELECT COUNT(*) AS count FROM feedback").get() as { count: number };
if (count === 0) {
  createFeedback({
    authorId: id("ankita@company.com"),
    recipientId: null,
    category: "Suggestion",
    message: "Could we move the weekly sync to Tuesday mornings? Mondays are always packed.",
  });
  createFeedback({
    authorId: id("rahul@company.com"),
    recipientId: id("ankita@company.com"),
    category: "Appreciation",
    message: "The new onboarding screens are beautiful. Customers noticed right away.",
  });
  createFeedback({
    authorId: id("priya@company.com"),
    recipientId: id("rahul@company.com"),
    category: "Concern",
    message: "Release notes often arrive after launch, which makes it hard to plan campaigns.",
  });
  createFeedback({
    authorId: id("arjun@company.com"),
    recipientId: null,
    category: "Appreciation",
    message: "Shout-out to whoever restocked the good coffee. Mornings are better now.",
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

console.log(`Seeded ${people.length} employees (password: password123).`);
