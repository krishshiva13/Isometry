import { Fact, Birthday, QuizQuestion } from '../types';
import { INITIAL_FACTS, INITIAL_BIRTHDAYS, INITIAL_QUIZ } from '../seed';

export type SearchItemType = 'article' | 'figure' | 'quiz' | 'tool';

export interface SearchIndexItem {
  id: string;
  type: SearchItemType;
  title: string;
  subtitle: string;
  category?: string;
  year?: string | number;
  description: string;
  url: string;
  icon?: string;
  badge?: string;
  tags: string[];
}

const TOOLS_INDEX: SearchIndexItem[] = [
  {
    id: 'tool-exam-prep',
    type: 'tool',
    title: 'Daily Exam Prep Hub & Current Affairs',
    subtitle: 'High-yield UPSC, SSC & Banking current affairs capsule & 5 MCQs',
    description: 'Syllabus-mapped daily current affairs compendium with printable PDF, exam traps, and practice test.',
    url: '/exam-prep',
    icon: '📚',
    badge: 'Study Tool',
    tags: ['exam', 'upsc', 'ssc', 'banking', 'current affairs', 'mcq', 'test']
  },
  {
    id: 'tool-quiz',
    type: 'quiz',
    title: 'Daily Trivia & Knowledge Quiz',
    subtitle: 'Interactive multi-category quiz with instant explanations & leaderboard',
    description: 'Test your knowledge on daily events, science discoveries, and history facts with top performer rankings.',
    url: '/quiz',
    icon: '⚡',
    badge: 'Quiz Topic',
    tags: ['quiz', 'trivia', 'test', 'questions', 'leaderboard', 'practice']
  },
  {
    id: 'tool-notebook',
    type: 'tool',
    title: 'My Student Notebook',
    subtitle: 'Personal study notes, highlight markers & revision cards',
    description: 'Access your saved notes, highlighted study facts, and custom test notes across all topics.',
    url: '/notebook',
    icon: '📓',
    badge: 'Study Tool',
    tags: ['notes', 'notebook', 'study', 'highlights', 'saved', 'revision']
  },
  {
    id: 'tool-flashcards',
    type: 'tool',
    title: 'Active Recall Flashcards Decks',
    subtitle: 'Spaced repetition flashcards for memory retention',
    description: 'Flip through key facts, dates, and historical terms to build long-term memory recall.',
    url: '/flashcards',
    icon: '🧠',
    badge: 'Study Tool',
    tags: ['flashcards', 'cards', 'memory', 'spaced repetition', 'study', 'recall']
  },
  {
    id: 'tool-timeline',
    type: 'tool',
    title: 'Interactive Historical Timelines',
    subtitle: 'Explore chronological eras from ancient antiquity to the modern space age',
    description: 'Visual chronological journey across millennia of human civilizational milestones.',
    url: '/timeline',
    icon: '⏳',
    badge: 'Study Tool',
    tags: ['timeline', 'chronology', 'history', 'eras', 'centuries', 'dates']
  },
  {
    id: 'tool-calendar',
    type: 'tool',
    title: 'Date Explorer & On This Day',
    subtitle: 'Search any calendar date to discover historical events and birthdays',
    description: 'Select any month and day of the year to see what happened on that day in history.',
    url: '/calendar',
    icon: '📅',
    badge: 'Study Tool',
    tags: ['calendar', 'date', 'on this day', 'today in history', 'day']
  },
  {
    id: 'tool-compare',
    type: 'tool',
    title: 'Topic Comparator & Side-by-Side Analysis',
    subtitle: 'Compare historical eras, inventions, and scientific breakthroughs',
    description: 'Side-by-side analysis of key moments, technological leaps, and civilizations.',
    url: '/compare',
    icon: '⚖️',
    badge: 'Study Tool',
    tags: ['compare', 'comparator', 'analysis', 'versus', 'side by side']
  },
  {
    id: 'tool-bookmarks',
    type: 'tool',
    title: 'Saved Facts & Bookmarks',
    subtitle: 'Your curated personal library of favorite articles and facts',
    description: 'Quickly revisit all the facts and stories you have bookmarked for later review.',
    url: '/bookmarks',
    icon: '🔖',
    badge: 'Personal',
    tags: ['bookmarks', 'saved', 'favorites', 'library', 'reading list']
  },
  {
    id: 'tool-read-later',
    type: 'tool',
    title: 'My Read Later List',
    subtitle: 'Personal reading queue of saved articles to explore at your own pace',
    description: 'Access your dedicated reading list, mark stories as read, and resume reading.',
    url: '/read-later',
    icon: '📖',
    badge: 'Reading List',
    tags: ['read later', 'reading list', 'queue', 'saved', 'articles', 'unread']
  }
];

const QUIZ_TOPICS_INDEX: SearchIndexItem[] = [
  {
    id: 'quiz-history',
    type: 'quiz',
    title: 'World History Quiz Arena',
    subtitle: 'Wars, Treaties, Empires & Civilizations',
    description: 'Challenge your knowledge of ancient empires, revolutions, and world political milestones.',
    url: '/quiz',
    category: 'history',
    icon: '🏛',
    badge: 'Quiz Topic',
    tags: ['history', 'wars', 'empires', 'treaties', 'berlin wall', 'cold war', 'quiz']
  },
  {
    id: 'quiz-science',
    type: 'quiz',
    title: 'Science & Breakthrough Discoveries Quiz',
    subtitle: 'Physics, Chemistry, Quantum & Biology',
    description: 'Test your understanding of natural laws, atomic discoveries, and breakthroughs.',
    url: '/quiz',
    category: 'science',
    icon: '🔬',
    badge: 'Quiz Topic',
    tags: ['science', 'physics', 'relativity', 'penicillin', 'dna', 'biology', 'quiz']
  },
  {
    id: 'quiz-inventions',
    type: 'quiz',
    title: 'Tech & Inventions Trivia Quiz',
    subtitle: 'Printing Press, Telephone, Internet & Computing',
    description: 'Explore the genesis of human tools that transformed society from print to modern code.',
    url: '/quiz',
    category: 'inventions',
    icon: '💡',
    badge: 'Quiz Topic',
    tags: ['inventions', 'tech', 'printing press', 'telephone', 'computer', 'quiz']
  },
  {
    id: 'quiz-astronomy',
    type: 'quiz',
    title: 'Cosmos & Space Exploration Quiz',
    subtitle: 'Moon Landing, Planetary Missions & Astrophysics',
    description: 'Questions on Apollo missions, planetary discoveries, cosmic laws, and space exploration.',
    url: '/quiz',
    category: 'discoveries',
    icon: '🔭',
    badge: 'Quiz Topic',
    tags: ['space', 'apollo', 'moon', 'nasa', 'astronomy', 'cosmos', 'quiz']
  },
  {
    id: 'quiz-daily-mcq',
    type: 'quiz',
    title: '5 High-Yield Daily Current Affairs MCQs',
    subtitle: 'Daily practice quiz mapped to competitive exams',
    description: 'Solve 5 curated daily MCQs with examiner trap alerts and comprehensive explanations.',
    url: '/exam-prep',
    icon: '🎯',
    badge: 'Exam Quiz',
    tags: ['daily mcq', 'exam', 'upsc', 'banking', 'current affairs', 'questions', 'quiz']
  }
];

class SearchIndexService {
  private items: SearchIndexItem[] = [];
  private isInitialized = false;

  constructor() {
    this.buildInitialIndex();
  }

  private buildInitialIndex() {
    const list: SearchIndexItem[] = [];

    // 1. Add tools & quiz topics
    list.push(...TOOLS_INDEX);
    list.push(...QUIZ_TOPICS_INDEX);

    // 2. Add initial facts / articles
    INITIAL_FACTS.forEach(fact => {
      list.push(this.transformFact(fact));
    });

    // 3. Add initial birthdays / historical figures
    INITIAL_BIRTHDAYS.forEach(bday => {
      list.push(this.transformBirthday(bday));
    });

    this.items = list;
    this.isInitialized = true;
  }

  private transformFact(fact: Fact): SearchIndexItem {
    const yearDisplay = fact.year < 0 ? `${Math.abs(fact.year)} BC` : `${fact.year}`;
    const tags = [
      fact.cat,
      String(fact.year),
      yearDisplay,
      ...(fact.vocabulary ? fact.vocabulary.map(v => v.word.toLowerCase()) : [])
    ];

    return {
      id: `article-${fact.id}`,
      type: 'article',
      title: fact.title,
      subtitle: `${fact.cat.toUpperCase()} · ${yearDisplay}`,
      category: fact.cat,
      year: yearDisplay,
      description: fact.excerpt,
      url: `/article/${fact.id}`,
      icon: fact.emoji || '📖',
      badge: `${fact.cat.charAt(0).toUpperCase() + fact.cat.slice(1)} Article`,
      tags
    };
  }

  private transformBirthday(bday: Birthday): SearchIndexItem {
    const yearDisplay = bday.year ? `${bday.year}` : '';
    const dateDisplay = bday.date || '';
    
    return {
      id: `figure-${bday.id}`,
      type: 'figure',
      title: bday.name,
      subtitle: `${bday.field || 'Historical Figure'} · Born ${dateDisplay}${yearDisplay ? `, ${yearDisplay}` : ''}`,
      category: 'history',
      year: yearDisplay,
      description: `${bday.name} was a celebrated historical personality in ${bday.field}.`,
      url: `/calendar`,
      icon: '👤',
      badge: 'Historical Figure',
      tags: ['historical figure', 'biography', 'birthday', bday.field?.toLowerCase() || '', bday.name.toLowerCase()]
    };
  }

  /**
   * Dynamically update index with live facts from Firestore
   */
  updateWithLiveFacts(facts: Fact[]) {
    if (!facts || facts.length === 0) return;

    // Filter out existing articles and re-add fresh ones
    const nonArticles = this.items.filter(i => i.type !== 'article');
    const articleItems = facts.map(f => this.transformFact(f));
    this.items = [...nonArticles, ...articleItems];
  }

  /**
   * Dynamically update index with live birthdays
   */
  updateWithLiveBirthdays(birthdays: Birthday[]) {
    if (!birthdays || birthdays.length === 0) return;

    const nonFigures = this.items.filter(i => i.type !== 'figure');
    const figureItems = birthdays.map(b => this.transformBirthday(b));
    this.items = [...nonFigures, ...figureItems];
  }

  /**
   * Search query across the in-memory index
   */
  search(queryStr: string, filterType: 'all' | SearchItemType = 'all', limitCount = 12): SearchIndexItem[] {
    const trimmed = queryStr.trim().toLowerCase();
    
    let pool = this.items;
    if (filterType !== 'all') {
      pool = pool.filter(item => item.type === filterType);
    }

    if (!trimmed) {
      // If query is empty, return popular starter items
      return pool.slice(0, limitCount);
    }

    const words = trimmed.split(/\s+/).filter(Boolean);

    // Score and rank matches
    const scored: Array<{ item: SearchIndexItem; score: number }> = [];

    for (const item of pool) {
      const titleLower = item.title.toLowerCase();
      const subtitleLower = item.subtitle.toLowerCase();
      const descLower = item.description.toLowerCase();
      const tagsJoined = item.tags.join(' ').toLowerCase();

      let score = 0;

      // Exact title match gets huge bonus
      if (titleLower === trimmed) {
        score += 150;
      } else if (titleLower.startsWith(trimmed)) {
        score += 80;
      } else if (titleLower.includes(trimmed)) {
        score += 50;
      }

      // Individual keyword matching
      for (const w of words) {
        if (titleLower.includes(w)) score += 25;
        if (subtitleLower.includes(w)) score += 15;
        if (tagsJoined.includes(w)) score += 15;
        if (descLower.includes(w)) score += 10;
        if (item.year && String(item.year).toLowerCase().includes(w)) score += 20;
      }

      if (score > 0) {
        scored.push({ item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limitCount).map(s => s.item);
  }
}

export const searchIndexService = new SearchIndexService();
