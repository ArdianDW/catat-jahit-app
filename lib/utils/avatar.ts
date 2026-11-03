export interface AvatarColor {
  bg: string;
  text: string;
}

export const AVATAR_PALETTES: AvatarColor[] = [
  { bg: "#D4E6D5", text: "#2D4A2F" },
  { bg: "#C8DFD4", text: "#1E3D30" },
  { bg: "#D6E4F0", text: "#1D3557" },
  { bg: "#E8D5E8", text: "#4A1E4A" },
  { bg: "#F0E4D0", text: "#5C3D11" },
  { bg: "#D5E8E4", text: "#1A3D38" },
  { bg: "#E4D5D5", text: "#4A1E1E" },
  { bg: "#DDE8D5", text: "#2B4A1A" },
  { bg: "#D5DCE8", text: "#1E2D4A" },
  { bg: "#E8E4D5", text: "#4A3D1A" },
  { bg: "#D5E8E8", text: "#1A3D3D" },
  { bg: "#E8D5E0", text: "#4A1A35" },
];

const colorCache = new Map<string, AvatarColor>();

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function getAvatarColors(seed: string): AvatarColor {
  const cached = colorCache.get(seed);
  if (cached) return cached;

  const index = hashString(seed) % AVATAR_PALETTES.length;
  const color = AVATAR_PALETTES[index];
  colorCache.set(seed, color);
  return color;
}

export function getInitials(name: string): string {
  if (!name || name.trim() === "") return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}
