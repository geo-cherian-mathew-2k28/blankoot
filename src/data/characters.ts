export interface Character {
  id: string;
  name: string;
  image: string;
  badge: string;
  tagline: string;
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const characters: Character[] = [
  {
    id: 'nova',
    name: 'Nova',
    image: `${base}/characters/nova.jpg`,
    badge: '⚡ Speedster',
    tagline: 'Rapid reaction speed',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    image: `${base}/characters/orbit.jpg`,
    badge: '🪐 Strategist',
    tagline: 'Deep tech generalist',
  },
  {
    id: 'echo',
    name: 'Echo',
    image: `${base}/characters/echo.jpg`,
    badge: '🎧 Beat Rider',
    tagline: 'Calculated answers',
  },
  {
    id: 'vex',
    name: 'Vex',
    image: `${base}/characters/vex.jpg`,
    badge: '🔮 Analytical',
    tagline: 'Zero missed rounds',
  },
  {
    id: 'pixel',
    name: 'Pixel',
    image: `${base}/characters/pixel.jpg`,
    badge: '👾 Architect',
    tagline: 'Systematic puzzle solver',
  },
  {
    id: 'bolt',
    name: 'Bolt',
    image: `${base}/characters/bolt.jpg`,
    badge: '🔥 Hot Streak',
    tagline: 'Combo point multiplier',
  },
  {
    id: 'luna',
    name: 'Luna',
    image: `${base}/characters/luna.jpg`,
    badge: '🌿 Calm Mind',
    tagline: 'Steady under pressure',
  },
];
