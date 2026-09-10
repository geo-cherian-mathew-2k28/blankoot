import { AvatarConfig } from './data/avatarSystem';

export interface Player {
  id: string;
  name: string;
  avatar: AvatarConfig | string;
  score: number;
  streak: number;
  answered: boolean;
  selectedAnswer?: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit?: number;
  category?: string;
  image?: string;
  mediaUrl?: string;
  multiplier?: number;
}
