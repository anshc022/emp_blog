// What the composer asks. Shared by the form (client) and sendFeedback (server), so the server
// only ever stores answers to questions it actually asked.
//
// A note to one person asks about working with them; a note to everyone asks about working here.
// Stars are optional, one per line. At least one written answer is required: stars alone say how
// someone feels, the words say what to do about it.
//
// Each stored rating and answer keeps its own label, so a note written today still reads correctly
// after these questions are reworded.

export type Audience = "person" | "company";

export type Rating = {
  id: string;
  label: string;
  /** The statement being rated, as the writer reads it. `{name}` is the recipient's first name. */
  statement: string;
};

export type Prompt = {
  id: string;
  /** Short heading shown above the answer when the note is read. */
  label: string;
  /** The question, as the writer reads it. `{name}` is the recipient's first name. */
  question: string;
  hint: string;
  optional?: boolean;
};

export const RATINGS: Record<Audience, Rating[]> = {
  person: [
    { id: "collaboration", label: "Collaboration", statement: "{name} is easy to work with" },
    { id: "communication", label: "Communication", statement: "{name} keeps people in the loop" },
    { id: "reliability", label: "Reliability", statement: "{name} delivers what they commit to, on time" },
    { id: "quality", label: "Quality of work", statement: "{name}'s work is solid and well thought through" },
    { id: "helpfulness", label: "Helpfulness", statement: "{name} helps others when they're stuck" },
  ],
  company: [
    { id: "clarity", label: "Clarity", statement: "I know what's expected of me, and why" },
    { id: "workload", label: "Workload", statement: "My workload is manageable" },
    { id: "communication", label: "Communication", statement: "I hear about decisions that affect me in time" },
    { id: "tools", label: "Tools & process", statement: "Our tools and process help more than they get in the way" },
    { id: "growth", label: "Growth", statement: "I'm learning and growing here" },
    { id: "recognition", label: "Recognition", statement: "Good work gets noticed" },
  ],
};

export const PROMPTS: Record<Audience, Prompt[]> = {
  person: [
    {
      id: "keep",
      label: "Keep doing",
      question: "What should {name} keep doing?",
      hint: "A strength you've seen. “The way you walked the client through the demo…” beats “you're great”.",
    },
    {
      id: "better",
      label: "Even better if",
      question: "What would make working with {name} even better?",
      hint: "One thing to start or stop, said the way you'd want to hear it.",
    },
    {
      id: "moment",
      label: "A moment",
      question: "A moment that stuck with you",
      hint: "What happened, and how did it land? Leave out anything that would give you away.",
      optional: true,
    },
  ],
  company: [
    {
      id: "working",
      label: "Working well",
      question: "What's working well at NextQom right now?",
      hint: "Something worth protecting as we grow.",
    },
    {
      id: "change",
      label: "One change",
      question: "If you could change one thing, what would it be?",
      hint: "Say what you'd do instead, if you have an idea.",
    },
    {
      id: "else",
      label: "Anything else",
      question: "Anything else leadership should hear?",
      hint: "Ideas, worries, a shout-out. Nothing is too small.",
      optional: true,
    },
  ],
};

/** What each number of stars means, shown as the writer picks. Index 0 is "not rated". */
export const STAR_WORDS = ["skip", "needs real work", "below what I'd hope", "solid", "really good", "outstanding"];

export const MAX_ANSWER = 1000;

export function fill(text: string, name: string) {
  return text.replaceAll("{name}", name);
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

/** A rating as stored with a note. */
export type GivenRating = { id: string; label: string; value: number };
/** An answer as stored with a note. */
export type GivenAnswer = { id: string; label: string; text: string };
