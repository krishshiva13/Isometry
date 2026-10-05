import { Fact } from '../types';

export interface UserInteractionRecord {
  articleId: string;
  title: string;
  category: string;
  tags?: string[];
  viewedAt: number;
}

export interface RecommendedArticle {
  fact: Fact;
  reason: string;
  score: number;
}

const STORAGE_KEY_INTERACTIONS = 'facthub_user_interactions_v1';
const STORAGE_KEY_FAVORITE_TOPICS = 'facthub_favorite_topics_v1';

export const TOPIC_PRESETS = [
  { id: 'history', label: '🏛 World History', category: 'history', keywords: ['war', 'revolution', 'empire', 'wall', 'berlin', 'ancient', 'treaty', 'civilization'] },
  { id: 'science', label: '🔬 Science & Physics', category: 'science', keywords: ['physics', 'relativity', 'quantum', 'einstein', 'atom', 'energy', 'space', 'gravity'] },
  { id: 'inventions', label: '💡 Tech & Inventions', category: 'inventions', keywords: ['telephone', 'press', 'gutenberg', 'computer', 'engine', 'electricity', 'internet'] },
  { id: 'discoveries', label: '🔭 Space & Discoveries', category: 'discoveries', keywords: ['moon', 'apollo', 'dna', 'penicillin', 'planet', 'mars', 'telescope', 'ocean'] },
  { id: 'medicine', label: '⚕️ Biology & Medicine', category: 'science', keywords: ['dna', 'penicillin', 'vaccine', 'biology', 'cells', 'medical', 'bacteria', 'cure'] },
  { id: 'figures', label: '👤 Historical Leaders', category: 'history', keywords: ['einstein', 'curie', 'gandhi', 'churchill', 'tesla', 'da vinci', 'newton'] }
];

export const userInteractionService = {
  /**
   * Record that a user viewed/read an article
   */
  recordArticleView(fact: Fact): void {
    if (!fact || !fact.id) return;
    try {
      const history = this.getInteractionHistory();
      // Remove existing entry for same article if present
      const filtered = history.filter(item => item.articleId !== fact.id);
      
      filtered.unshift({
        articleId: fact.id,
        title: fact.title,
        category: fact.cat,
        tags: [fact.cat, String(fact.year)],
        viewedAt: Date.now()
      });

      // Keep last 40 interactions
      localStorage.setItem(STORAGE_KEY_INTERACTIONS, JSON.stringify(filtered.slice(0, 40)));
    } catch (e) {
      console.warn('[UserInteraction] Failed to record view:', e);
    }
  },

  /**
   * Get past article interactions list
   */
  getInteractionHistory(): UserInteractionRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_INTERACTIONS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },

  /**
   * Get user's explicitly selected or auto-derived favorite topics
   */
  getFavoriteTopics(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FAVORITE_TOPICS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    // Auto-derive from interaction history if no explicit topics saved
    const history = this.getInteractionHistory();
    if (history.length > 0) {
      const catFrequency: Record<string, number> = {};
      history.forEach(h => {
        catFrequency[h.category] = (catFrequency[h.category] || 0) + 1;
      });
      const topCats = Object.entries(catFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(([cat]) => cat);
      return topCats.slice(0, 3);
    }

    // Default starter topics
    return ['history', 'science', 'inventions'];
  },

  /**
   * Save user's selected favorite topics
   */
  setFavoriteTopics(topics: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITE_TOPICS, JSON.stringify(topics));
    } catch (e) {
      console.warn('[UserInteraction] Failed to save favorite topics:', e);
    }
  },

  /**
   * Toggle a favorite topic on or off
   */
  toggleFavoriteTopic(topicId: string): string[] {
    const current = this.getFavoriteTopics();
    let updated: string[];
    if (current.includes(topicId)) {
      updated = current.filter(t => t !== topicId);
      if (updated.length === 0) updated = ['history']; // keep at least one
    } else {
      updated = [...current, topicId];
    }
    this.setFavoriteTopics(updated);
    return updated;
  },

  /**
   * Compute intelligent recommendations from all available facts
   */
  getRecommendations(allFacts: Fact[], currentArticleId?: string, limitCount = 6): RecommendedArticle[] {
    if (!allFacts || allFacts.length === 0) return [];

    const history = this.getInteractionHistory();
    const favTopics = this.getFavoriteTopics();
    const readArticleIds = new Set(history.map(h => h.articleId));
    
    // Category frequencies in history
    const catFreq: Record<string, number> = {};
    history.forEach(h => {
      catFreq[h.category] = (catFreq[h.category] || 0) + 1;
    });

    // Score each candidate fact
    const scoredList: RecommendedArticle[] = [];

    for (const fact of allFacts) {
      if (currentArticleId && fact.id === currentArticleId) continue;

      let score = 0;
      let primaryReason = 'Editor Curated Pick';

      // 1. Matches favorite topic explicitly chosen by user (+50)
      if (favTopics.includes(fact.cat)) {
        score += 50;
        primaryReason = `Matches your favorite topic: ${fact.cat.toUpperCase()}`;
      }

      // Check keyword overlap with favorite topics
      for (const preset of TOPIC_PRESETS) {
        if (favTopics.includes(preset.id)) {
          const content = `${fact.title} ${fact.excerpt} ${fact.full || ''}`.toLowerCase();
          const matchKw = preset.keywords.find(kw => content.includes(kw));
          if (matchKw) {
            score += 35;
            primaryReason = `Because you like ${preset.label}`;
            break;
          }
        }
      }

      // 2. High reading frequency in this category (+15 per past read)
      if (catFreq[fact.cat]) {
        score += Math.min(45, catFreq[fact.cat] * 15);
        if (score < 40) {
          primaryReason = `Based on your recent interest in ${fact.cat}`;
        }
      }

      // 3. Related to the most recently read article (+30)
      if (history.length > 0) {
        const lastRead = history[0];
        if (fact.cat === lastRead.category && fact.id !== lastRead.articleId) {
          score += 30;
          primaryReason = `Because you read "${lastRead.title.slice(0, 28)}…"`;
        }
      }

      // 4. Featured bonus (+20)
      if (fact.featured) {
        score += 20;
      }

      // 5. Slight preference for unread articles (+15)
      if (!readArticleIds.has(fact.id)) {
        score += 15;
      } else {
        score -= 10; // Read before, deprioritize slightly
      }

      scoredList.push({
        fact,
        reason: primaryReason,
        score
      });
    }

    // Sort by score descending
    scoredList.sort((a, b) => b.score - a.score);

    return scoredList.slice(0, limitCount);
  },

  /**
   * Clear interaction history
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_INTERACTIONS);
    } catch {}
  }
};
