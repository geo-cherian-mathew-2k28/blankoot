export interface MascotAvatar {
  id: string;
  name: string;
  color: string;
  tagline: string;
  image: string;
}

export const OFFICIAL_MASCOTS: MascotAvatar[] = [
  {
    id: 'sparky_purple',
    name: 'Sparky',
    color: '#8b5cf6',
    tagline: 'High Voltage Thinker',
    image: '/ai_avatars/sparky_purple.png',
  },
  {
    id: 'smug_blue',
    name: 'Smuggy',
    color: '#3b82f6',
    tagline: 'Cool, Calm & Calculated',
    image: '/ai_avatars/smug_blue.png',
  },
  {
    id: 'winky_pink',
    name: 'Twinkle',
    color: '#ec4899',
    tagline: 'Playful Quiz Whiz',
    image: '/ai_avatars/winky_pink.png',
  },
  {
    id: 'happy_green',
    name: 'Sprout',
    color: '#22c55e',
    tagline: 'Joyful & Ready to Jump',
    image: '/ai_avatars/happy_green.png',
  },
  {
    id: 'grumpy_red',
    name: 'Blaze',
    color: '#ef4444',
    tagline: 'Fierce Competitor',
    image: '/ai_avatars/grumpy_red.png',
  },
  {
    id: 'shy_yellow',
    name: 'Buttercup',
    color: '#f59e0b',
    tagline: 'Gentle Genius',
    image: '/ai_avatars/shy_yellow.png',
  },
  {
    id: 'chill_cyan',
    name: 'Breeze',
    color: '#06b6d4',
    tagline: 'Floating on High Scores',
    image: '/ai_avatars/chill_cyan.png',
  },
  {
    id: 'surprised_blue',
    name: 'Pip',
    color: '#0284c7',
    tagline: 'Curious Wonderer',
    image: '/ai_avatars/surprised_blue.png',
  },
  {
    id: 'playful_lilac',
    name: 'Boba',
    color: '#a855f7',
    tagline: 'Winking Speedster',
    image: '/ai_avatars/playful_lilac.png',
  },
  {
    id: 'sneaky_orange',
    name: 'Mischief',
    color: '#f97316',
    tagline: 'Strategist Extraordinaire',
    image: '/ai_avatars/sneaky_orange.png',
  },
  {
    id: 'cool_lime',
    name: 'Zest',
    color: '#84cc16',
    tagline: 'Sharp-Eyed Pro',
    image: '/ai_avatars/cool_lime.png',
  },
  {
    id: 'giggle_pink',
    name: 'Peaches',
    color: '#f43f5e',
    tagline: 'Pure Fun & Energy',
    image: '/ai_avatars/giggle_pink.png',
  },
  {
    id: 'bouncy_rose',
    name: 'Rosie',
    color: '#fb7185',
    tagline: 'Grooving to First Place',
    image: '/ai_avatars/bouncy_rose.png',
  },
];

export function getMascotById(id: string): MascotAvatar {
  return OFFICIAL_MASCOTS.find((m) => m.id === id) || OFFICIAL_MASCOTS[0];
}

export function getRandomMascot(): MascotAvatar {
  return OFFICIAL_MASCOTS[Math.floor(Math.random() * OFFICIAL_MASCOTS.length)];
}
