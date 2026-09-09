// Procedural SVG Avatar Generator & Customizer for 100+ Unique Cohort Players
// Supports millions of unique combinations (Shapes, Expressions, Eyes, Mouths, Hats/Accessories, Colors)

export interface AvatarConfig {
  baseColor: string;
  shape: 'circle' | 'squircle' | 'hexagon' | 'shield';
  eyes: 'dot' | 'happy' | 'glasses' | 'wink' | 'star' | 'cool' | 'robot' | 'wide';
  mouth: 'smile' | 'open' | 'smirk' | 'teeth' | 'cool' | 'neutral';
  accessory: 'none' | 'headphones' | 'crown' | 'cap' | 'horns' | 'halo' | 'bandana' | 'antenna';
  pattern: 'none' | 'dots' | 'stripes' | 'circuit';
}

export const AVATAR_PALETTES = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#e11d48', // Rose/Red
  '#7c3aed', // Violet
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#ea580c', // Orange
  '#16a34a', // Green
  '#0284c7', // Sky
  '#db2777', // Pink
  '#475569', // Slate
  '#ca8a04', // Yellow
  '#9333ea', // Purple
  '#65a30d', // Lime
  '#0d9488', // Teal
];

export const AVATAR_SHAPES: AvatarConfig['shape'][] = ['circle', 'squircle', 'hexagon', 'shield'];
export const AVATAR_EYES: AvatarConfig['eyes'][] = ['happy', 'glasses', 'dot', 'star', 'cool', 'wink', 'robot', 'wide'];
export const AVATAR_MOUTHS: AvatarConfig['mouth'][] = ['smile', 'open', 'smirk', 'teeth', 'cool', 'neutral'];
export const AVATAR_ACCESSORIES: AvatarConfig['accessory'][] = ['none', 'headphones', 'crown', 'cap', 'horns', 'halo', 'bandana', 'antenna'];

// Deterministic seed generator so any name or player ID gets a consistent unique avatar
export function generateAvatarFromSeed(seed: string): AvatarConfig {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const abs = Math.abs(hash);

  return {
    baseColor: AVATAR_PALETTES[abs % AVATAR_PALETTES.length],
    shape: AVATAR_SHAPES[(abs >> 2) % AVATAR_SHAPES.length],
    eyes: AVATAR_EYES[(abs >> 4) % AVATAR_EYES.length],
    mouth: AVATAR_MOUTHS[(abs >> 6) % AVATAR_MOUTHS.length],
    accessory: AVATAR_ACCESSORIES[(abs >> 8) % AVATAR_ACCESSORIES.length],
    pattern: (['none', 'dots', 'stripes', 'circuit'] as const)[(abs >> 10) % 4],
  };
}

export function serializeAvatar(cfg: AvatarConfig): string {
  return `${cfg.baseColor}|${cfg.shape}|${cfg.eyes}|${cfg.mouth}|${cfg.accessory}|${cfg.pattern}`;
}

export function deserializeAvatar(str: string): AvatarConfig {
  const parts = str.split('|');
  if (parts.length >= 6) {
    return {
      baseColor: parts[0],
      shape: parts[1] as AvatarConfig['shape'],
      eyes: parts[2] as AvatarConfig['eyes'],
      mouth: parts[3] as AvatarConfig['mouth'],
      accessory: parts[4] as AvatarConfig['accessory'],
      pattern: parts[5] as AvatarConfig['pattern'],
    };
  }
  return generateAvatarFromSeed(str);
}
