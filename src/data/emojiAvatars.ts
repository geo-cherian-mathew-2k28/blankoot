export interface EmojiAvatarItem {
  id: string;
  name: string;
  image: string;
  category: 'cool' | 'wild' | 'expressive' | 'savage' | 'chill';
  color: string;
  tagline: string;
}

export const EMOJI_CATEGORIES = [
  { id: 'all', label: '🌟 All (35)' },
  { id: 'cool', label: '😎 Cool & Confident' },
  { id: 'expressive', label: '✨ Expressive' },
  { id: 'wild', label: '🤪 Wild & Funny' },
  { id: 'savage', label: '🔥 Savage & Intense' },
  { id: 'chill', label: '🧊 Chill Vibes' },
] as const;

export const EMOJI_AVATARS: EmojiAvatarItem[] = [
  {
    id: 'emoji_1',
    name: 'Party Horn',
    image: '/emojis/emoji_1.webp',
    category: 'wild',
    color: '#f59e0b',
    tagline: 'Ready to celebrate every win!',
  },
  {
    id: 'emoji_2',
    name: 'Wink Star',
    image: '/emojis/emoji_2.webp',
    category: 'expressive',
    color: '#ec4899',
    tagline: 'Always one step ahead with a smile',
  },
  {
    id: 'emoji_3',
    name: 'Cool Shades',
    image: '/emojis/emoji_3.webp',
    category: 'cool',
    color: '#3b82f6',
    tagline: 'Zero pressure, pure confidence',
  },
  {
    id: 'emoji_4',
    name: 'Grin Master',
    image: '/emojis/emoji_4.webp',
    category: 'expressive',
    color: '#10b981',
    tagline: 'Big energy, bigger brains',
  },
  {
    id: 'emoji_5',
    name: 'Heart Eyes',
    image: '/emojis/emoji_5.webp',
    category: 'expressive',
    color: '#f43f5e',
    tagline: 'Loving the quiz rush!',
  },
  {
    id: 'emoji_7',
    name: 'Tongue Out Fun',
    image: '/emojis/emoji_7.webp',
    category: 'wild',
    color: '#8b5cf6',
    tagline: 'Playing for laughs & first place',
  },
  {
    id: 'emoji_8',
    name: 'Laugh Attack',
    image: '/emojis/emoji_8.webp',
    category: 'wild',
    color: '#eab308',
    tagline: 'Too funny to lose focus',
  },
  {
    id: 'emoji_9',
    name: 'Smirk Prodigy',
    image: '/emojis/emoji_9.webp',
    category: 'cool',
    color: '#06b6d4',
    tagline: 'Already calculated the score',
  },
  {
    id: 'emoji_10',
    name: 'Mind Blown',
    image: '/emojis/emoji_10.webp',
    category: 'expressive',
    color: '#f97316',
    tagline: 'Brain power at 1000% capacity',
  },
  {
    id: 'emoji_11',
    name: 'Chill Snooze',
    image: '/emojis/emoji_11.webp',
    category: 'chill',
    color: '#64748b',
    tagline: 'Winning without breaking a sweat',
  },
  {
    id: 'emoji_12',
    name: 'Money Bag',
    image: '/emojis/emoji_12.webp',
    category: 'savage',
    color: '#22c55e',
    tagline: 'Stacking points like coins',
  },
  {
    id: 'emoji_13',
    name: 'Devil Mischief',
    image: '/emojis/emoji_13.webp',
    category: 'savage',
    color: '#dc2626',
    tagline: 'Plotting a comeback victory',
  },
  {
    id: 'emoji_14',
    name: 'Angel Halo',
    image: '/emojis/emoji_14.webp',
    category: 'expressive',
    color: '#38bdf8',
    tagline: 'Pure honest quiz maestro',
  },
  {
    id: 'emoji_16',
    name: 'Fire Rage',
    image: '/emojis/emoji_16.webp',
    category: 'savage',
    color: '#ef4444',
    tagline: 'On a burning hot streak',
  },
  {
    id: 'emoji_17',
    name: 'Ghostly Boo',
    image: '/emojis/emoji_17.webp',
    category: 'wild',
    color: '#a855f7',
    tagline: 'Sneaking up the leaderboard',
  },
  {
    id: 'emoji_18',
    name: 'Cry Laughing',
    image: '/emojis/emoji_18.webp',
    category: 'wild',
    color: '#0284c7',
    tagline: 'Tears of joy on every correct answer',
  },
  {
    id: 'emoji_19',
    name: 'Shock Wonder',
    image: '/emojis/emoji_19.webp',
    category: 'expressive',
    color: '#f59e0b',
    tagline: 'Unbelievable clutch plays',
  },
  {
    id: 'emoji_20',
    name: 'Zipped Secret',
    image: '/emojis/emoji_20.webp',
    category: 'chill',
    color: '#6b7280',
    tagline: 'Secret answers locked in',
  },
  {
    id: 'emoji_21',
    name: 'Monocle Detective',
    image: '/emojis/emoji_21.webp',
    category: 'cool',
    color: '#d97706',
    tagline: 'Analyzing every clue meticulously',
  },
  {
    id: 'emoji_22',
    name: 'Nerd Glasses',
    image: '/emojis/emoji_22.webp',
    category: 'cool',
    color: '#2563eb',
    tagline: 'Knowledge is real super power',
  },
  {
    id: 'emoji_23',
    name: 'Thinking Genius',
    image: '/emojis/emoji_23.webp',
    category: 'expressive',
    color: '#eab308',
    tagline: 'Deep pondering in progress',
  },
  {
    id: 'emoji_24',
    name: 'Clown Joy',
    image: '/emojis/emoji_24.webp',
    category: 'wild',
    color: '#e11d48',
    tagline: 'Maximum entertainment guaranteed',
  },
  {
    id: 'emoji_25',
    name: 'Alien Orbit',
    image: '/emojis/emoji_25.webp',
    category: 'wild',
    color: '#10b981',
    tagline: 'Out-of-this-world intellect',
  },
  {
    id: 'emoji_26',
    name: 'Robot Core',
    image: '/emojis/emoji_26.webp',
    category: 'savage',
    color: '#06b6d4',
    tagline: 'Algorithmic accuracy at speed',
  },
  {
    id: 'emoji_27',
    name: 'Skull Rebel',
    image: '/emojis/emoji_27.webp',
    category: 'savage',
    color: '#e2e8f0',
    tagline: 'Fearless and unstoppable',
  },
  {
    id: 'emoji_28',
    name: 'Starstruck Glow',
    image: '/emojis/emoji_28.webp',
    category: 'expressive',
    color: '#fbbf24',
    tagline: 'Shining bright at top rank',
  },
  {
    id: 'emoji_29',
    name: 'Cowboy Hero',
    image: '/emojis/emoji_29.webp',
    category: 'cool',
    color: '#b45309',
    tagline: 'Fastest buzzer in the arena',
  },
  {
    id: 'emoji_30',
    name: 'Poop Gold',
    image: '/emojis/emoji_30.webp',
    category: 'wild',
    color: '#854d0e',
    tagline: 'Unexpected legend in the room',
  },
  {
    id: 'emoji_31',
    name: 'Hugging Warmth',
    image: '/emojis/emoji_31.webp',
    category: 'expressive',
    color: '#fb7185',
    tagline: 'Friendly competition all the way',
  },
  {
    id: 'emoji_32',
    name: 'Dizzy Swirl',
    image: '/emojis/emoji_32.webp',
    category: 'wild',
    color: '#c084fc',
    tagline: 'Mind spinning from high speeds',
  },
  {
    id: 'emoji_33',
    name: 'Cold Breeze',
    image: '/emojis/emoji_33.webp',
    category: 'chill',
    color: '#38bdf8',
    tagline: 'Icy veins under question timer',
  },
  {
    id: 'emoji_34',
    name: 'Vomit Rainbow',
    image: '/emojis/emoji_34.webp',
    category: 'wild',
    color: '#84cc16',
    tagline: 'Overloaded with quiz facts',
  },
  {
    id: 'emoji_36',
    name: 'Exploding Spark',
    image: '/emojis/emoji_36.webp',
    category: 'savage',
    color: '#f97316',
    tagline: 'Total blast of score points',
  },
  {
    id: 'emoji_37',
    name: 'Pleading Eyes',
    image: '/emojis/emoji_37.webp',
    category: 'expressive',
    color: '#f472b6',
    tagline: 'Hoping for a lucky bonus round',
  },
  {
    id: 'emoji_38',
    name: 'Sleepy Dreamer',
    image: '/emojis/emoji_38.webp',
    category: 'chill',
    color: '#818cf8',
    tagline: 'Dreaming of the victory trophy',
  },
];

export function getEmojiAvatarById(idOrPath: string): EmojiAvatarItem {
  if (!idOrPath) return EMOJI_AVATARS[0];

  // 1. Exact match by id or image path
  const exact = EMOJI_AVATARS.find((e) => e.id === idOrPath || e.image === idOrPath);
  if (exact) return exact;

  // 2. Exact match by extracting emoji number (e.g., 'emoji_12', '/emojis/emoji_12.webp')
  const matchNum = idOrPath.match(/emoji_(\d+)/);
  if (matchNum) {
    const targetId = `emoji_${matchNum[1]}`;
    const byId = EMOJI_AVATARS.find((e) => e.id === targetId);
    if (byId) return byId;
  }

  return EMOJI_AVATARS[0];
}

export function getRandomEmojiAvatar(): EmojiAvatarItem {
  const index = Math.floor(Math.random() * EMOJI_AVATARS.length);
  return EMOJI_AVATARS[index];
}

export function isEmojiAvatar(avatar: string): boolean {
  if (!avatar || typeof avatar !== 'string') return false;
  if (avatar.startsWith('/emojis/') || avatar.startsWith('emoji_')) return true;
  return EMOJI_AVATARS.some((e) => e.id === avatar || e.image === avatar);
}
