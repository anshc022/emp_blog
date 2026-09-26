/**
 * Fills the database with demo data: one teacher, a class of students, a few
 * past sessions spread over the last week and one live session (code 123456).
 *
 *   npm run seed
 *
 * WARNING: wipes the users, sessions and doubts collections first.
 */
import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import mongoose, { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import { Doubt } from "@/models/Doubt";
import { Session } from "@/models/Session";
import { User } from "@/models/User";

loadEnvConfig(process.cwd());

const PASSWORD = "password123";
const LIVE_CODE = "123456";

const STUDENTS = [
  ["Aarav Mehta", "student@demo.edu"],
  ["Diya Patel", "student2@demo.edu"],
  ["Kabir Singh", "student3@demo.edu"],
  ["Meera Iyer", "student4@demo.edu"],
  ["Rohan Das", "student5@demo.edu"],
  ["Sara Khan", "student6@demo.edu"],
  ["Vihaan Rao", "student7@demo.edu"],
  ["Zoya Ali", "student8@demo.edu"],
] as const;

type DoubtSeed = [topic: string, text: string];

const SESSIONS: { title: string; subject: string; daysAgo: number; hour: number; doubts: DoubtSeed[] }[] = [
  {
    title: "Limits and Continuity",
    subject: "Calculus",
    daysAgo: 6,
    hour: 9,
    doubts: [
      ["Limits", "What does it actually mean for a limit to exist if the function isn't defined at that point?"],
      ["Limits", "Why do left-hand and right-hand limits need to be equal?"],
      ["Continuity", "Is every differentiable function continuous, or the other way around?"],
      ["Limits", "How do we handle 0/0 forms without L'Hôpital's rule?"],
      ["Continuity", "Can a function be continuous everywhere but nowhere differentiable?"],
      ["Limits", "Why is the limit of sin(x)/x as x approaches 0 equal to 1?"],
    ],
  },
  {
    title: "Derivatives in Practice",
    subject: "Calculus",
    daysAgo: 5,
    hour: 11,
    doubts: [
      ["Derivatives", "When should I use the chain rule versus the product rule?"],
      ["Derivatives", "Why is the derivative of e^x equal to itself?"],
      ["Derivatives", "How do we differentiate implicitly when y is on both sides?"],
      ["Applications", "How do I know if a critical point is a maximum or a minimum?"],
      ["Derivatives", "What is the derivative of a^x where a is a constant?"],
      ["Applications", "How are related rates problems set up step by step?"],
      ["Derivatives", "Why does the derivative of ln(x) equal 1/x?"],
    ],
  },
  {
    title: "Newton's Laws",
    subject: "Physics",
    daysAgo: 4,
    hour: 14,
    doubts: [
      ["Forces", "If action and reaction are equal and opposite, why do things move at all?"],
      ["Friction", "Why is static friction greater than kinetic friction?"],
      ["Forces", "How do we draw a free-body diagram for an object on an incline?"],
      ["Forces", "Is normal force always equal to mg?"],
      ["Friction", "Does friction depend on the contact area?"],
    ],
  },
  {
    title: "Integration Techniques",
    subject: "Calculus",
    daysAgo: 2,
    hour: 11,
    doubts: [
      ["Integrals", "How do I choose u and dv for integration by parts?"],
      ["Integrals", "When does substitution fail and I need partial fractions instead?"],
      ["Integrals", "Why do we add +C to indefinite integrals?"],
      ["Derivatives", "Is integration always the exact reverse of differentiation?"],
      ["Integrals", "How do I integrate sin^2(x)?"],
      ["Integrals", "What's the geometric meaning of a definite integral being negative?"],
      ["Applications", "How do we find the area between two curves that cross each other?"],
    ],
  },
  {
    title: "Work, Energy and Power",
    subject: "Physics",
    daysAgo: 1,
    hour: 15,
    doubts: [
      ["Energy", "Why is work done zero when carrying a bag horizontally?"],
      ["Energy", "Where does the energy go in an inelastic collision?"],
      ["Forces", "Can the work done by friction ever be positive?"],
      ["Energy", "What's the difference between power and energy in simple words?"],
    ],
  },
];

const LIVE_DOUBTS: DoubtSeed[] = [
  ["Arrays", "What's the difference between an array and a linked list in terms of memory?"],
  ["Recursion", "How do I know what the base case of a recursive function should be?"],
  ["Big-O", "Why is binary search O(log n) and not O(n/2)?"],
  ["Recursion", "Does recursion always use more memory than a loop?"],
  ["Big-O", "Do we drop constants in Big-O even when they're huge?"],
];

const rand = (n: number) => Math.floor(Math.random() * n);
const pickSome = <T,>(arr: readonly T[], n: number) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

function at(daysAgo: number, hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, rand(60), 0);
  return d;
}

async function main() {
  await connectDB();
  console.log("Connected to", mongoose.connection.name);

  await Promise.all([User.deleteMany({}), Session.deleteMany({}), Doubt.deleteMany({})]);
  await Promise.all([User.syncIndexes(), Session.syncIndexes(), Doubt.syncIndexes()]);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const teacher = await User.create({ name: "Prof. Priya Rao", email: "teacher@demo.edu", passwordHash, role: "teacher" });
  const students = await User.insertMany(
    STUDENTS.map(([name, email]) => ({ name, email, passwordHash, role: "student" as const })),
  );
  const studentIds = students.map((s) => s._id as Types.ObjectId);

  let sessionCount = 0;
  let doubtCount = 0;
  let codeSeed = 200000;

  const addDoubts = async (sessionId: Types.ObjectId, doubts: DoubtSeed[], daysAgo: number, hour: number, live: boolean) => {
    const docs = doubts.map(([topic, text], i) => {
      const authorId = studentIds[rand(studentIds.length)];
      const voters = pickSome(
        studentIds.filter((id) => !id.equals(authorId)),
        rand(live ? 4 : 7),
      );
      // Spread doubts over a ~2 hour class, so the "by hour" chart has shape.
      const createdAt = live ? new Date(Date.now() - (doubts.length - i) * 4 * 60_000) : at(daysAgo, hour + (i % 3 === 2 ? 1 : 0), rand(60));
      const answered = !live && Math.random() < 0.65;
      return {
        sessionId,
        authorId,
        isAnonymous: Math.random() < 0.75,
        text,
        topic,
        upvotes: voters,
        upvoteCount: voters.length,
        status: answered ? "answered" : "open",
        answer: answered && Math.random() < 0.6 ? "Covered in class — see the worked example on the board." : undefined,
        answeredAt: answered ? new Date(createdAt.getTime() + (10 + rand(40)) * 60_000) : null,
        createdAt,
      };
    });
    // timestamps: false so our back-dated createdAt values are kept.
    await Doubt.insertMany(docs, { timestamps: false } as never);
    doubtCount += docs.length;
  };

  for (const s of SESSIONS) {
    const createdAt = at(s.daysAgo, s.hour, 0);
    const session = await Session.create({
      title: s.title,
      subject: s.subject,
      teacherId: teacher._id,
      joinCode: String(codeSeed++),
      isActive: false,
      createdAt,
      endedAt: new Date(createdAt.getTime() + 2 * 60 * 60_000),
    });
    await Session.updateOne({ _id: session._id }, { $set: { createdAt } }, { timestamps: false });
    await addDoubts(session._id, s.doubts, s.daysAgo, s.hour, false);
    sessionCount++;
  }

  const live = await Session.create({
    title: "Data Structures: Live Q&A",
    subject: "Computer Science",
    teacherId: teacher._id,
    joinCode: LIVE_CODE,
    isActive: true,
  });
  await addDoubts(live._id, LIVE_DOUBTS, 0, new Date().getHours(), true);
  sessionCount++;

  console.log(`Seeded 1 teacher, ${students.length} students, ${sessionCount} sessions, ${doubtCount} doubts.\n`);
  console.log("Log in with (password for everyone: %s)", PASSWORD);
  console.log("  Teacher:  teacher@demo.edu");
  console.log("  Students: student@demo.edu, student2@demo.edu … student8@demo.edu");
  console.log(`  Live session join code: ${LIVE_CODE}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
