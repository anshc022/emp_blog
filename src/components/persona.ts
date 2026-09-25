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

const BRIGHTS = ["var(--lime)", "var(--pink)", "var(--blue)", "var(--yellow)", "var(--lilac)", "var(--orange)", "var(--mint)"];

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
