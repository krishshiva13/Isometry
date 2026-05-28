export type Category = 'history' | 'science' | 'inventions' | 'discoveries' | 'birthdays';

export interface Fact {
  id: string;
  cat: Category;
  emoji: string;
  title: string;
  year: number;
  excerpt: string;
  full: string;
  featured: boolean;
  createdAt?: string;
  imageUrl?: string;
  eventMonth?: number;
  eventDay?: number;
}

export interface Birthday {
  id: string;
  name: string;
  year: number;
  field: string;
  date: string;
  color: string;
  init: string;
  createdAt?: string;
}

export interface QuizQuestion {
  id: string;
  q: string;
  opts: string[];
  correct: number;
  cat: string;
  createdAt?: string;
}

export interface Subscriber {
  email: string;
  subscribedAt: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
}
