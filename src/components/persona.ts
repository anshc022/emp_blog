// Fun, per-message aliases. They are derived from the feedback id only,
// never from the author, so they can't be used to link notes to a person.

const ADJECTIVES = [
  "Sneaky", "Unbothered", "Chaotic", "Mysterious", "Caffeinated", "Sleepy",
  "Dramatic", "Wholesome", "Spicy", "Lowkey", "Certified", "Feral",
  "Iconic", "Galaxy-brain", "Chill", "Suspicious", "Main-character", "Silent",
  "Honest", "Undercover", "Cozy", "Bold", "Sassy", "Zen",
];

const CRITTERS: [string, string][] = [
  ["Frog", "🐸"], ["Fox", "🦊"], ["Panda", "🐼"], ["Raccoon", "🦝"],
  ["Penguin", "🐧"], ["Unicorn", "🦄"], ["Octopus", "🐙"], ["Sloth", "🦥"],
  ["Flamingo", "🦩"], ["Turtle", "🐢"], ["Hedgehog", "🦔"], ["Koala", "🐨"],
  ["Otter", "🦦"], ["Bee", "🐝"], ["Butterfly", "🦋"], ["Snail", "🐌"],
  ["Crab", "🦀"], ["Whale", "🐳"], ["Owl", "🦉"], ["Cat", "🐱"],
  ["Pupper", "🐶"], ["Dino", "🦕"], ["Hamster", "🐹"], ["Seal", "🦭"],
];

// Candy gradients for avatars.
const BRIGHTS = [
  "linear-gradient(135deg, #ffd1ec, #ff8cc6)",
  "linear-gradient(135deg, #e3d7ff, #a98bff)",
  "linear-gradient(135deg, #ffe6c2, #ffab66)",
  "linear-gradient(135deg, #c9f6dc, #62d6a0)",
  "linear-gradient(135deg, #cfe3ff, #78a9ff)",
  "linear-gradient(135deg, #fff0b8, #ffcc4d)",
  "linear-gradient(135deg, #c6f5ee, #52cfc0)",
];

export function persona(id: number) {
  const adjective = ADJECTIVES[(id * 7 + 3) % ADJECTIVES.length];
  const [animal, emoji] = CRITTERS[(id * 13 + 5) % CRITTERS.length];
  return { name: `${adjective} ${animal}`, emoji, color: BRIGHTS[(id * 3) % BRIGHTS.length] };
}

export function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return BRIGHTS[Math.abs(h) % BRIGHTS.length];
}
