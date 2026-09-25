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

export function persona(id: number) {
  const adjective = ADJECTIVES[(id * 7 + 3) % ADJECTIVES.length];
  const [animal, emoji] = CRITTERS[(id * 13 + 5) % CRITTERS.length];
  return { name: `${adjective} ${animal}`.toLowerCase(), emoji };
}
