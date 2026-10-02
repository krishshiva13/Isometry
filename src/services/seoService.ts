import { SEOAuditReport, SEOAuditCheckItem, SEOKeywordResearchResult, Fact } from '../types';

export interface KeywordValidationRule {
  id: string;
  label: string;
  passed: boolean;
  hint: string;
}

export interface KeywordValidationResult {
  isValid: boolean;
  status: 'empty' | 'invalid' | 'warning' | 'valid';
  message: string;
  charCount: number;
  wordCount: number;
  keywordType?: 'Short-Tail' | 'Mid-Tail (Optimal)' | 'Long-Tail';
  cleanedQuery: string;
  canAutoClean: boolean;
  warnings: string[];
  rules: KeywordValidationRule[];
  score: number; // 0 to 100 formatting quality score
}

/**
 * Real-time validator for Google SEO Keyword Research queries
 * Provides immediate feedback on query length, word count, syntax, search operators, and formatting
 */
export function validateKeywordQuery(rawQuery: string): KeywordValidationResult {
  const query = rawQuery || '';
  const trimmed = query.trim();
  const charCount = query.length;
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (!trimmed) {
    return {
      isValid: false,
      status: 'empty',
      message: 'Type an article topic or focus keyword to research search trends.',
      charCount: 0,
      wordCount: 0,
      cleanedQuery: '',
      canAutoClean: false,
      warnings: [],
      rules: [
        { id: 'length', label: 'Length: 2-80 characters', passed: false, hint: 'Minimum 2 characters needed' },
        { id: 'words', label: 'Word Count: 2-5 words recommended', passed: false, hint: 'Target 2-5 words for optimal Page 1 results' },
        { id: 'clean', label: 'Clean Syntax: No URLs, symbols, or operators', passed: false, hint: 'Avoid syntax characters and pasted links' },
        { id: 'entity', label: 'Entity: Clear topical subject', passed: false, hint: 'Enter a person, event, concept, or invention' }
      ],
      score: 0
    };
  }

  const warnings: string[] = [];
  let cleaned = trimmed;

  // Rule checks
  let isCleanSyntax = true;
  let isGoodEntity = true;

  // Check 1: HTML tags pasted
  if (/<[^>]*>/g.test(cleaned)) {
    warnings.push('HTML tags detected. Stripping markup for clean search analysis.');
    cleaned = cleaned.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    isCleanSyntax = false;
  }

  // Check 2: Google Advanced Search Operators (site:, intitle:, filetype:, inurl:, cache:)
  const operatorMatch = cleaned.match(/\b(site|inurl|intitle|allintitle|filetype|related|cache):[^\s]+/gi);
  if (operatorMatch) {
    warnings.push(`Search operator (${operatorMatch[0]}) detected. Keyword research evaluates organic topic phrases without operators.`);
    cleaned = cleaned.replace(/\b(site|inurl|intitle|allintitle|filetype|related|cache):[^\s]+/gi, '').replace(/\s+/g, ' ').trim();
    isCleanSyntax = false;
  }

  // Check 3: URL pasted
  const isUrl = /^https?:\/\//i.test(cleaned) || /^www\./i.test(cleaned) || /\.[a-z]{2,6}\/[^\s]*/i.test(cleaned);
  if (isUrl) {
    try {
      const urlCandidate = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
      const urlObj = new URL(urlCandidate);
      const pathname = decodeURIComponent(urlObj.pathname).replace(/[\/_+-]+/g, ' ').trim();
      const searchParam = urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || urlObj.searchParams.get('search');
      if (searchParam && searchParam.length >= 2) {
        cleaned = searchParam.replace(/[\/_+-]+/g, ' ').trim();
      } else if (pathname.length >= 2) {
        cleaned = pathname;
      }
    } catch {
      cleaned = cleaned.replace(/^https?:\/\/(www\.)?/, '').replace(/[\/_+-]+/g, ' ').trim();
    }
    warnings.push('URL format detected. Extracted the clean topic phrase for search intent.');
    isCleanSyntax = false;
  }

  // Check 4: Kebab-case or snake_case slug format (e.g. james_webb_telescope, moon-landing)
  if (/[a-zA-Z0-9]+[-_][a-zA-Z0-9]+/.test(cleaned)) {
    warnings.push('Slug formatting (hyphens/underscores) detected. Auto-clean replaces separators with spaces.');
    cleaned = cleaned.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    isCleanSyntax = false;
  }

  // Check 5: Wrapping quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
    warnings.push('Quotes detected. Search volume metrics are best calculated on unquoted phrases.');
    isCleanSyntax = false;
  }

  // Check 6: Trailing / excessive punctuation
  if (/[!?,.:;#$%^&*()_=+\[\]{}<>\\/|`~]+$/.test(cleaned)) {
    warnings.push('Trailing punctuation detected. Stripping symbols for cleaner Google matching.');
    cleaned = cleaned.replace(/[!?,.:;#$%^&*()_=+\[\]{}<>\\/|`~]+$/g, '').trim();
    isCleanSyntax = false;
  }

  if (/([!?#$*~+=]{2,})/g.test(cleaned)) {
    warnings.push('Excessive symbols or punctuation found in query.');
    cleaned = cleaned.replace(/([!?#$*~+=]{2,})/g, ' ').replace(/\s+/g, ' ').trim();
    isCleanSyntax = false;
  }

  // Check 7: Multiple consecutive whitespace
  if (/\s{2,}/.test(cleaned)) {
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
  }

  // Auto Capitalize first letters of words in cleaned if input was all lowercase
  if (cleaned.length > 2 && cleaned === cleaned.toLowerCase() && !cleaned.includes('.')) {
    cleaned = cleaned
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  const canAutoClean = cleaned.toLowerCase() !== trimmed.toLowerCase() || cleaned !== trimmed;

  // Check 8: Too short (< 2 characters)
  if (trimmed.length < 2) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Query is too short. Please enter at least 2 characters.',
      charCount,
      wordCount,
      cleanedQuery: cleaned,
      canAutoClean: false,
      warnings: ['Minimum 2 characters required.'],
      rules: [
        { id: 'length', label: 'Length: 2-80 characters', passed: false, hint: 'At least 2 characters required' },
        { id: 'words', label: 'Word Count: 2-5 words recommended', passed: false, hint: 'Single letters cannot be analyzed' },
        { id: 'clean', label: 'Clean Syntax: No URLs, symbols, or operators', passed: isCleanSyntax, hint: 'Check for punctuation' },
        { id: 'entity', label: 'Entity: Clear topical subject', passed: false, hint: 'Specify a topic or entity' }
      ],
      score: 15
    };
  }

  // Check 9: Only symbols / punctuation
  if (!/[a-zA-Z0-9]/.test(trimmed)) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Query contains only symbols. Please enter letters or topic terms.',
      charCount,
      wordCount: 0,
      cleanedQuery: '',
      canAutoClean: false,
      warnings: ['No alphanumeric characters found.'],
      rules: [
        { id: 'length', label: 'Length: 2-80 characters', passed: true, hint: 'Meets length' },
        { id: 'words', label: 'Word Count: 2-5 words recommended', passed: false, hint: 'No words found' },
        { id: 'clean', label: 'Clean Syntax: No URLs, symbols, or operators', passed: false, hint: 'All punctuation' },
        { id: 'entity', label: 'Entity: Clear topical subject', passed: false, hint: 'No subject found' }
      ],
      score: 10
    };
  }

  // Check 10: Single stop word
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'it', 'what', 'how', 'when', 'why']);
  if (wordCount === 1 && stopWords.has(trimmed.toLowerCase())) {
    isGoodEntity = false;
    return {
      isValid: false,
      status: 'invalid',
      message: `"${trimmed}" is a generic grammatical word. Add an entity or concept (e.g., "${trimmed.charAt(0).toUpperCase() + trimmed.slice(1)} Silk Road").`,
      charCount,
      wordCount,
      cleanedQuery: cleaned,
      canAutoClean,
      warnings: ['Generic stop word without topic entity.'],
      rules: [
        { id: 'length', label: 'Length: 2-80 characters', passed: true, hint: 'Length OK' },
        { id: 'words', label: 'Word Count: 2-5 words recommended', passed: false, hint: 'Single stop-word' },
        { id: 'clean', label: 'Clean Syntax: No URLs, symbols, or operators', passed: isCleanSyntax, hint: 'Syntax OK' },
        { id: 'entity', label: 'Entity: Clear topical subject', passed: false, hint: 'Add a subject entity' }
      ],
      score: 25
    };
  }

  // Check 11: Numbers only
  if (/^\d+$/.test(trimmed)) {
    isGoodEntity = false;
    warnings.push('Numerical query: add topical context (e.g., "Year 1969 Moon Landing" or "Apollo 11").');
    return {
      isValid: true,
      status: 'warning',
      message: 'Numbers only: consider specifying the context (e.g., "Apollo 11" instead of "11").',
      charCount,
      wordCount,
      keywordType: 'Short-Tail',
      cleanedQuery: cleaned,
      canAutoClean,
      warnings,
      rules: [
        { id: 'length', label: 'Length: 2-80 characters', passed: true, hint: 'Length OK' },
        { id: 'words', label: 'Word Count: 2-5 words recommended', passed: false, hint: 'Numerical only' },
        { id: 'clean', label: 'Clean Syntax: No URLs, symbols, or operators', passed: isCleanSyntax, hint: 'Syntax OK' },
        { id: 'entity', label: 'Entity: Clear topical subject', passed: false, hint: 'Add descriptive topic' }
      ],
      score: 55
    };
  }

  // Check 12: Excessively long query (> 80 chars or > 8 words)
  const isGoodLength = charCount <= 80 && wordCount <= 8;
  if (!isGoodLength) {
    warnings.push(`Query is quite long (${wordCount} words, ${charCount} chars). Focus on core 2-5 word topics for optimal Page 1 research.`);
  }

  // Classify keyword tail & formulate feedback
  let keywordType: KeywordValidationResult['keywordType'] = 'Mid-Tail (Optimal)';
  let message = 'Optimal mid-tail phrase: Ideal balance of search volume and Page 1 ranking intent.';
  let isOptimalWords = true;

  if (wordCount === 1) {
    keywordType = 'Short-Tail';
    message = 'Short-tail keyword: High monthly search volume with broader competitive landscape.';
    isOptimalWords = false;
  } else if (wordCount > 5) {
    keywordType = 'Long-Tail';
    message = 'Long-tail query: High searcher intent, excellent for featured snippets and quick ranking.';
    isOptimalWords = wordCount <= 8;
  }

  // Calculate formatting quality score (0 to 100)
  let score = 100;
  if (!isGoodLength) score -= 25;
  if (!isCleanSyntax) score -= 20;
  if (wordCount === 1) score -= 15;
  if (wordCount > 6) score -= 15;
  if (warnings.length > 0) score -= warnings.length * 10;
  score = Math.max(30, Math.min(100, score));

  const rules: KeywordValidationRule[] = [
    {
      id: 'length',
      label: `Length: ${charCount}/80 chars`,
      passed: charCount >= 2 && charCount <= 80,
      hint: charCount > 80 ? 'Query exceeds 80 characters' : 'Length is within optimal index limits'
    },
    {
      id: 'words',
      label: `Word Count: ${wordCount} words (${keywordType})`,
      passed: wordCount >= 2 && wordCount <= 6,
      hint: wordCount === 1 ? '1 word: broader search volume' : wordCount > 6 ? '7+ words: long phrase' : 'Optimal 2-5 words'
    },
    {
      id: 'clean',
      label: 'Clean Syntax: No URLs or operators',
      passed: isCleanSyntax,
      hint: isCleanSyntax ? 'No syntax pollution detected' : 'Formatting issues detected (click Auto-Format)'
    },
    {
      id: 'entity',
      label: 'Entity: Clear topical subject',
      passed: isGoodEntity,
      hint: 'Identifies a recognizable historical, scientific, or general topic'
    }
  ];

  const finalStatus = warnings.length > 0 ? 'warning' : 'valid';

  return {
    isValid: true,
    status: finalStatus,
    message: warnings.length > 0 ? warnings[0] : message,
    charCount,
    wordCount,
    keywordType,
    cleanedQuery: cleaned,
    canAutoClean,
    warnings,
    rules,
    score
  };
}

/**
 * Calculates keyword count and density in text
 */
function getKeywordStats(text: string, keyword: string): { count: number; density: number } {
  if (!text || !keyword || !keyword.trim()) return { count: 0, density: 0 };
  const cleanText = text.toLowerCase();
  const cleanKeyword = keyword.toLowerCase().trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return { count: 0, density: 0 };

  const regex = new RegExp(`\\b${cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const matches = cleanText.match(regex);
  const count = matches ? matches.length : 0;
  const density = parseFloat(((count / words.length) * 100).toFixed(2));
  return { count, density };
}

/**
 * Parses markdown to count headings (H1, H2, H3) and checks keyword presence
 */
function analyzeHeadings(markdown: string, keyword?: string): {
  h1: number;
  h2: number;
  h3: number;
  h2Texts: string[];
  keywordInH2: boolean;
} {
  if (!markdown) {
    return { h1: 0, h2: 0, h3: 0, h2Texts: [], keywordInH2: false };
  }

  const lines = markdown.split('\n');
  let h1 = 0;
  let h2 = 0;
  let h3 = 0;
  const h2Texts: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      h1++;
    } else if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      h2++;
      h2Texts.push(trimmed.replace('## ', '').trim());
    } else if (trimmed.startsWith('### ')) {
      h3++;
    }
  }

  const cleanKeyword = keyword ? keyword.toLowerCase().trim() : '';
  const keywordInH2 = Boolean(
    cleanKeyword &&
    h2Texts.some(h => h.toLowerCase().includes(cleanKeyword))
  );

  return { h1, h2, h3, h2Texts, keywordInH2 };
}

/**
 * Live client-side Google SEO 12-factor ranking auditor
 */
export function analyzeOnPageSEO(post: {
  title: string;
  full: string;
  excerpt?: string;
  targetKeyword?: string;
  focusKeyword?: string;
  seoTitle?: string;
  metaDescription?: string;
  imageAlt?: string;
  imageUrl?: string;
  faqs?: Array<{ question: string; answer: string }>;
  quizMCQs?: any[];
}): SEOAuditReport {
  const title = (post.seoTitle || post.title || '').trim();
  const metaDesc = (post.metaDescription || post.excerpt || '').trim();
  const body = (post.full || '').trim();
  const keyword = (post.focusKeyword || post.targetKeyword || '').trim();
  const words = body.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const checks: SEOAuditCheckItem[] = [];
  let totalScore = 0;
  const criticalFixes: string[] = [];
  const recommendedImprovements: string[] = [];

  // Check 1: Target Focus Keyword Defined
  if (keyword.length > 2) {
    checks.push({
      id: 'focus-keyword',
      label: 'Focus Keyword Defined',
      status: 'pass',
      scoreImpact: 10,
      currentValue: keyword,
      recommendedValue: '1 Primary Search Term',
      explanation: `Target keyword is set to "${keyword}". Google needs a clear thematic focus to understand query intent.`
    });
    totalScore += 10;
  } else {
    checks.push({
      id: 'focus-keyword',
      label: 'Focus Keyword Defined',
      status: 'fail',
      scoreImpact: 0,
      currentValue: 'None',
      recommendedValue: 'Set 1 specific keyword (e.g. "James Webb Space Telescope")',
      explanation: 'No focus keyword defined. Without a primary keyword, search engines struggle to rank the page for high-intent queries.'
    });
    criticalFixes.push('Define a clear primary search keyword for this post using the Keyword Researcher.');
  }

  // Check 2: SEO Title Tag Length (Ideal 45 - 60 characters)
  const titleLen = title.length;
  if (titleLen >= 40 && titleLen <= 65) {
    checks.push({
      id: 'title-length',
      label: 'SEO Title Length',
      status: 'pass',
      scoreImpact: 10,
      currentValue: `${titleLen} characters`,
      recommendedValue: '45 - 60 characters',
      explanation: 'Perfect title length. It fits within Google’s 600px desktop/mobile pixel limit without truncation.'
    });
    totalScore += 10;
  } else if (titleLen > 0 && (titleLen < 40 || titleLen <= 75)) {
    checks.push({
      id: 'title-length',
      label: 'SEO Title Length',
      status: 'warning',
      scoreImpact: 6,
      currentValue: `${titleLen} characters`,
      recommendedValue: '45 - 60 characters',
      explanation: titleLen < 40 
        ? 'Title is a bit short. Add a high-intent modifier (e.g., Year, "Explained", "Complete Guide").' 
        : 'Title exceeds 65 characters and may be clipped with "..." on Google search results.'
    });
    totalScore += 6;
    recommendedImprovements.push('Adjust Title to between 45 and 60 characters to maximize SERP click-through rate.');
  } else {
    checks.push({
      id: 'title-length',
      label: 'SEO Title Length',
      status: 'fail',
      scoreImpact: 0,
      currentValue: titleLen === 0 ? 'Empty' : `${titleLen} characters (too long)`,
      recommendedValue: '45 - 60 characters',
      explanation: 'Title is empty or severely exceeds Google SERP display width.'
    });
    criticalFixes.push('Provide an optimized SEO Title Tag (45-60 characters).');
  }

  // Check 3: Focus Keyword in Title Tag
  if (keyword) {
    const titleLower = title.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    if (titleLower.includes(keywordLower)) {
      const isFrontLoaded = titleLower.indexOf(keywordLower) < 25;
      if (isFrontLoaded) {
        checks.push({
          id: 'keyword-in-title',
          label: 'Keyword in Title (Front-Loaded)',
          status: 'pass',
          scoreImpact: 15,
          currentValue: 'Front-Loaded',
          recommendedValue: 'Within first 30 chars',
          explanation: `Great! The focus keyword "${keyword}" is front-loaded in the title, which Google algorithm heavily weighs for ranking.`
        });
        totalScore += 15;
      } else {
        checks.push({
          id: 'keyword-in-title',
          label: 'Keyword in Title',
          status: 'warning',
          scoreImpact: 10,
          currentValue: 'Present (later in title)',
          recommendedValue: 'Within first 30 chars',
          explanation: `The focus keyword appears in the title, but try placing it closer to the start of the title for maximum algorithmic weight.`
        });
        totalScore += 10;
        recommendedImprovements.push(`Move "${keyword}" toward the front of your Title.`);
      }
    } else {
      checks.push({
        id: 'keyword-in-title',
        label: 'Keyword in Title',
        status: 'fail',
        scoreImpact: 0,
        currentValue: 'Missing',
        recommendedValue: `Include "${keyword}"`,
        explanation: `The target keyword "${keyword}" is missing from the title. This is one of Google’s highest correlation ranking factors.`
      });
      criticalFixes.push(`Include your target keyword "${keyword}" in the title.`);
    }
  }

  // Check 4: Meta Description Length (Ideal 130 - 160 characters)
  const metaLen = metaDesc.length;
  if (metaLen >= 125 && metaLen <= 165) {
    checks.push({
      id: 'meta-description-length',
      label: 'Meta Description Length',
      status: 'pass',
      scoreImpact: 10,
      currentValue: `${metaLen} characters`,
      recommendedValue: '130 - 160 characters',
      explanation: 'Optimal meta description length. Provides a compelling snippet without being cut off in SERPs.'
    });
    totalScore += 10;
  } else if (metaLen > 50 && metaLen < 125) {
    checks.push({
      id: 'meta-description-length',
      label: 'Meta Description Length',
      status: 'warning',
      scoreImpact: 6,
      currentValue: `${metaLen} characters (short)`,
      recommendedValue: '130 - 160 characters',
      explanation: 'Meta description is a bit short. Add a secondary benefit or call-to-action (e.g., "Explore key facts, timeline, and exam notes here.").'
    });
    totalScore += 6;
    recommendedImprovements.push('Expand your Meta Description to 130-160 characters to occupy full Google snippet space.');
  } else {
    checks.push({
      id: 'meta-description-length',
      label: 'Meta Description Length',
      status: 'fail',
      scoreImpact: 0,
      currentValue: metaLen === 0 ? 'Missing' : `${metaLen} characters`,
      recommendedValue: '130 - 160 characters',
      explanation: 'Meta description is missing or excessively long (>165 chars).'
    });
    criticalFixes.push('Write a meta description between 130 and 160 characters.');
  }

  // Check 5: Focus Keyword in Meta Description
  if (keyword) {
    if (metaDesc.toLowerCase().includes(keyword.toLowerCase())) {
      checks.push({
        id: 'keyword-in-meta',
        label: 'Keyword in Meta Description',
        status: 'pass',
        scoreImpact: 10,
        currentValue: 'Present',
        recommendedValue: `Contains "${keyword}"`,
        explanation: `Keyword is present in the meta description. Google bolds matching search terms in search snippets, boosting CTR.`
      });
      totalScore += 10;
    } else {
      checks.push({
        id: 'keyword-in-meta',
        label: 'Keyword in Meta Description',
        status: 'fail',
        scoreImpact: 0,
        currentValue: 'Missing',
        recommendedValue: `Contains "${keyword}"`,
        explanation: `Keyword "${keyword}" is not in the meta description. When users search, unbolded snippets get fewer clicks.`
      });
      criticalFixes.push(`Add "${keyword}" naturally to your meta description.`);
    }
  }

  // Check 6: Content Depth & Word Count (> 500 words for quality)
  if (wordCount >= 600) {
    checks.push({
      id: 'word-count',
      label: 'Comprehensive Content Depth',
      status: 'pass',
      scoreImpact: 15,
      currentValue: `${wordCount} words (~${readingTimeMinutes} min read)`,
      recommendedValue: '600+ words',
      explanation: 'Excellent content depth! Comprehensive posts satisfy Google Helpful Content Update (HCU) requirements.'
    });
    totalScore += 15;
  } else if (wordCount >= 300) {
    checks.push({
      id: 'word-count',
      label: 'Content Depth',
      status: 'warning',
      scoreImpact: 9,
      currentValue: `${wordCount} words`,
      recommendedValue: '600+ words',
      explanation: 'Moderate content length. Adding subtopics, key milestones, or historical context will improve rank competitiveness.'
    });
    totalScore += 9;
    recommendedImprovements.push('Add 200-300 more words detailing background context or FAQs to dominate search results.');
  } else {
    checks.push({
      id: 'word-count',
      label: 'Content Depth',
      status: 'fail',
      scoreImpact: 3,
      currentValue: `${wordCount} words (Thin content)`,
      recommendedValue: '600+ words',
      explanation: 'Content is under 300 words. Google frequently flags thin content and avoids ranking it on Page 1.'
    });
    totalScore += 3;
    criticalFixes.push('Expand the article body with more factual detail, key milestones, and explanations.');
  }

  // Check 7: Heading Architecture (H2 Subheadings)
  const headingStats = analyzeHeadings(body, keyword);
  if (headingStats.h2 >= 2) {
    checks.push({
      id: 'headings-h2',
      label: 'Structured H2 Subheadings',
      status: 'pass',
      scoreImpact: 10,
      currentValue: `${headingStats.h2} H2 subheadings`,
      recommendedValue: 'At least 2 H2 subheadings',
      explanation: 'Strong logical hierarchy. H2 subheadings break up text, retain readers, and allow Google crawlers to index key sections.'
    });
    totalScore += 10;
  } else {
    checks.push({
      id: 'headings-h2',
      label: 'Structured H2 Subheadings',
      status: 'warning',
      scoreImpact: 4,
      currentValue: `${headingStats.h2} H2 subheadings`,
      recommendedValue: 'At least 2-4 H2 subheadings',
      explanation: 'Add ## markdown subheadings answering "People Also Ask" questions so Google can award jump-links in SERP.'
    });
    totalScore += 4;
    recommendedImprovements.push('Add at least two ## subheadings in your text (e.g. ## Background & Origin, ## Key Significance).');
  }

  // Check 8: Keyword in H2 Subheading
  if (keyword) {
    if (headingStats.keywordInH2) {
      checks.push({
        id: 'keyword-in-h2',
        label: 'Focus Keyword in H2',
        status: 'pass',
        scoreImpact: 10,
        currentValue: 'Included in H2',
        recommendedValue: 'At least 1 H2 contains keyword',
        explanation: 'Great! Having the keyword in an H2 signals deep thematic relevance for sub-queries.'
      });
      totalScore += 10;
    } else {
      checks.push({
        id: 'keyword-in-h2',
        label: 'Focus Keyword in H2',
        status: 'warning',
        scoreImpact: 4,
        currentValue: 'Not in any H2',
        recommendedValue: 'Include keyword in 1 H2',
        explanation: `Include "${keyword}" or a close variation in one of your ## subheadings.`
      });
      totalScore += 4;
      recommendedImprovements.push(`Include "${keyword}" in one of your ## subheadings.`);
    }
  }

  // Check 9: Keyword Density
  const kwStats = getKeywordStats(body, keyword);
  if (keyword) {
    if (kwStats.density >= 0.8 && kwStats.density <= 2.8) {
      checks.push({
        id: 'keyword-density',
        label: 'Keyword Density',
        status: 'pass',
        scoreImpact: 10,
        currentValue: `${kwStats.density}% (${kwStats.count} times)`,
        recommendedValue: '1.0% - 2.5%',
        explanation: 'Natural keyword frequency. Avoids Google’s algorithmic over-optimization penalty while retaining strong relevance.'
      });
      totalScore += 10;
    } else if (kwStats.density < 0.8) {
      checks.push({
        id: 'keyword-density',
        label: 'Keyword Density',
        status: 'warning',
        scoreImpact: 5,
        currentValue: `${kwStats.density}% (${kwStats.count} times)`,
        recommendedValue: '1.0% - 2.5%',
        explanation: `Keyword appears only ${kwStats.count} time(s). Mention "${keyword}" naturally 2-3 more times throughout the article.`
      });
      totalScore += 5;
      recommendedImprovements.push(`Mention "${keyword}" a few more times throughout the body paragraphs.`);
    } else {
      checks.push({
        id: 'keyword-density',
        label: 'Keyword Density',
        status: 'warning',
        scoreImpact: 4,
        currentValue: `${kwStats.density}% (${kwStats.count} times)`,
        recommendedValue: '< 3.0%',
        explanation: 'Keyword frequency is high (>2.8%). Beware of keyword stuffing penalties from Google algorithms.'
      });
      totalScore += 4;
      recommendedImprovements.push('Reduce keyword repetitions and replace some instances with synonyms/LSI keywords.');
    }
  }

  // Check 10: Image with Alt Text (Google Image Search & Accessibility)
  if (post.imageUrl) {
    if (post.imageAlt && post.imageAlt.length > 5) {
      checks.push({
        id: 'image-alt',
        label: 'Image SEO & Alt Text',
        status: 'pass',
        scoreImpact: 5,
        currentValue: `Alt: "${post.imageAlt.substring(0, 30)}..."`,
        recommendedValue: 'Descriptive Alt text set',
        explanation: 'Image Alt text is properly defined. Enables indexing on Google Images and assists screen readers.'
      });
      totalScore += 5;
    } else {
      checks.push({
        id: 'image-alt',
        label: 'Image SEO & Alt Text',
        status: 'warning',
        scoreImpact: 2,
        currentValue: 'Alt text missing or too short',
        recommendedValue: 'Descriptive Alt text with keyword',
        explanation: 'Image exists but lacks descriptive Alt text. Alt text is essential for Google Image search ranking.'
      });
      totalScore += 2;
      recommendedImprovements.push('Add descriptive Alt text containing your keyword to the main article image.');
    }
  } else {
    checks.push({
      id: 'image-alt',
      label: 'Visual Asset (Featured Image)',
      status: 'warning',
      scoreImpact: 1,
      currentValue: 'No image attached',
      recommendedValue: 'Add an HD featured image',
      explanation: 'Articles with visual media achieve 94% more views and qualify for Google Discover and Google News carousel.'
    });
    totalScore += 1;
    recommendedImprovements.push('Add an HD featured image to qualify for Google Discover and rich snippets.');
  }

  // Check 11: Schema.org FAQ Rich Snippet Potential
  const hasFaqs = (post.faqs && post.faqs.length > 0) || (post.quizMCQs && post.quizMCQs.length > 0);
  if (hasFaqs) {
    checks.push({
      id: 'faq-schema',
      label: 'FAQ / Rich Schema Potential',
      status: 'pass',
      scoreImpact: 5,
      currentValue: 'Active FAQ questions available',
      recommendedValue: 'Schema.org FAQPage structured data',
      explanation: 'Eligible for Google FAQ Rich Snippets! This expands your search snippet size by 200%, pushing competitors down.'
    });
    totalScore += 5;
  } else {
    checks.push({
      id: 'faq-schema',
      label: 'FAQ / Rich Schema Potential',
      status: 'warning',
      scoreImpact: 2,
      currentValue: 'No FAQ attached',
      recommendedValue: '2-3 FAQs for Google Rich Snippet',
      explanation: 'Adding 2-3 Frequently Asked Questions unlocks Google’s accordion rich snippet on Page 1.'
    });
    totalScore += 2;
    recommendedImprovements.push('Add 2-3 FAQs to qualify for Google Rich Snippets.');
  }

  const normalizedScore = Math.min(100, Math.round(totalScore));
  let rating: SEOAuditReport['rating'] = 'Poor';
  if (normalizedScore >= 85) rating = 'Excellent (Page 1 Ready)';
  else if (normalizedScore >= 70) rating = 'Good';
  else if (normalizedScore >= 50) rating = 'Average';

  return {
    overallScore: normalizedScore,
    rating,
    checks,
    criticalFixes,
    recommendedImprovements,
    wordCount,
    readingTimeMinutes,
    keywordDensity: kwStats.density,
    headingsCount: { h1: headingStats.h1, h2: headingStats.h2, h3: headingStats.h3 }
  };
}

/**
 * Helper to build an instant, high-quality client-side SEO Keyword Research Result
 */
export function buildClientFallbackSEOResult(topic: string, category: string = 'history'): SEOKeywordResearchResult {
  const cleanTopic = topic.trim();
  const capitalized = cleanTopic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const wordCount = cleanTopic.split(' ').length;
  const currentYear = new Date().getFullYear();

  return {
    topic: cleanTopic,
    focusKeyword: cleanTopic.toLowerCase(),
    searchIntent: 'Informational',
    searchVolumeTier: wordCount <= 2 ? 'High (50k-100k)' : 'Medium (10k-50k)',
    competitionLevel: wordCount >= 3 ? 'Low' : 'Medium',
    difficultyScore: wordCount >= 3 ? 34 : 52,
    secondaryKeywords: [
      `${cleanTopic} facts`,
      `${cleanTopic} history`,
      `${cleanTopic} summary`,
      `${cleanTopic} timeline`,
      `significance of ${cleanTopic}`,
      `${cleanTopic} for exams`,
      `${cleanTopic} GK questions`,
      `${cleanTopic} study notes`
    ],
    longTailKeywords: [
      `what is the true importance of ${cleanTopic}`,
      `top verified facts about ${cleanTopic} for students`,
      `complete chronological timeline of ${cleanTopic}`,
      `why is ${cleanTopic} important in world history`
    ],
    peopleAlsoAsk: [
      {
        question: `What is the significance of ${cleanTopic}?`,
        snippetAnswer: `${capitalized} represents a pivotal subject in ${category}, widely studied for its historical, scientific, and cultural significance.`,
        targetHeading: 'H2'
      },
      {
        question: `When was ${cleanTopic} first recorded or discovered?`,
        snippetAnswer: `Major milestones and verified discoveries related to ${cleanTopic} span decades of documented archives and historical breakthroughs.`,
        targetHeading: 'H2'
      },
      {
        question: `Why is ${cleanTopic} important for students and competitive exams?`,
        snippetAnswer: `Questions on ${cleanTopic} regularly appear in general awareness, history, and static GK sections of competitive exams.`,
        targetHeading: 'H3'
      },
      {
        question: `What are the most surprising facts about ${cleanTopic}?`,
        snippetAnswer: `Modern researchers have revealed groundbreaking insights regarding the origins, evolution, and global influence of ${cleanTopic}.`,
        targetHeading: 'H3'
      }
    ],
    titleTagIdeas: [
      {
        title: `${capitalized}: Top Facts, History & Significance (${currentYear})`,
        characterCount: `${capitalized}: Top Facts, History & Significance (${currentYear})`.length,
        clickHook: 'Frontloaded focus keyword with comprehensive authority'
      },
      {
        title: `What is ${capitalized}? Complete Facts & Exam Guide`,
        characterCount: `What is ${capitalized}? Complete Facts & Exam Guide`.length,
        clickHook: 'Direct question format answering Google People Also Ask intent'
      },
      {
        title: `${capitalized} Explained: 10 Verified Facts & Timeline`,
        characterCount: `${capitalized} Explained: 10 Verified Facts & Timeline`.length,
        clickHook: 'Curiosity listicle hook optimized for high click-through rate'
      }
    ],
    metaDescription: `Discover verified facts, key milestones, and historical context about ${cleanTopic}. Read our fact-checked editorial guide with exam-oriented GK and timeline.`,
    suggestedTags: [
      cleanTopic.toLowerCase(),
      category.toLowerCase(),
      'verified facts',
      'history',
      'general knowledge',
      'education'
    ],
    faqSchema: [
      {
        question: `What is ${cleanTopic}?`,
        answer: `${capitalized} is a prominent subject in ${category} recognized worldwide for its profound cultural, scientific, and educational value.`
      },
      {
        question: `Why should students learn about ${cleanTopic}?`,
        answer: `Understanding ${cleanTopic} helps students master crucial concepts for school curricula and competitive examinations.`
      },
      {
        question: `How does FActHub verify information on ${cleanTopic}?`,
        answer: `All facts published on FActHub are cross-referenced with encyclopedic archives, peer-reviewed journals, and historical records.`
      }
    ],
    contentOutline: [
      {
        headingLevel: 'H1',
        text: `${capitalized}: Complete Educational Overview & Timeline`,
        rationale: 'Establishes clear topical authority with exact-match focus keyword in H1.'
      },
      {
        headingLevel: 'H2',
        text: `Overview & Historical Origins of ${capitalized}`,
        rationale: 'Addresses broad informational intent and primary entity definitions.'
      },
      {
        headingLevel: 'H2',
        text: `Key Milestones & Chronological Timeline`,
        rationale: 'Structured chronological sequence encourages Google featured snippet indexing.'
      },
      {
        headingLevel: 'H2',
        text: `Core Significance & Modern Legacy`,
        rationale: 'Demonstrates comprehensive thematic depth satisfying E-E-A-T guidelines.'
      },
      {
        headingLevel: 'H2',
        text: `Frequently Asked Questions About ${capitalized}`,
        rationale: 'Directly qualifies for Google FAQ rich snippet accordion display.'
      }
    ],
    rankingTips: [
      `Place "${cleanTopic}" in your H1 title and within the first 100 words of the text.`,
      `Structure content using at least two H2 subheadings answering user search queries.`,
      `Embed Schema.org FAQPage structured data to claim rich snippet real estate on Page 1.`,
      `Maintain a keyword density between 1.0% and 2.5% to avoid over-optimization penalties.`,
      `Include an HD image with descriptive Alt text containing your primary keyword.`
    ]
  };
}

/**
 * Calls the backend Gemini SEO Keyword Researcher endpoint with robust fallback
 */
export async function researchKeywordsWithAI(params: {
  topic: string;
  category?: string;
  targetAudience?: string;
}): Promise<SEOKeywordResearchResult> {
  const cleanTopic = (params.topic || '').trim();
  if (!cleanTopic) {
    throw new Error('Please enter a keyword or topic to research.');
  }

  try {
    const response = await fetch('/api/seo/research-keyword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seedKeyword: cleanTopic,
        topic: cleanTopic,
        keyword: cleanTopic,
        category: params.category || 'history',
        targetAudience: params.targetAudience
      })
    });

    if (response.ok) {
      const data = await response.json();
      const rawResult = data.result || data;
      if (rawResult && typeof rawResult === 'object') {
        // Guarantee all arrays and required fields exist to prevent frontend runtime errors
        const fallback = buildClientFallbackSEOResult(cleanTopic, params.category);
        return {
          ...fallback,
          ...rawResult,
          topic: rawResult.topic || cleanTopic,
          focusKeyword: rawResult.focusKeyword || cleanTopic.toLowerCase(),
          secondaryKeywords: Array.isArray(rawResult.secondaryKeywords) && rawResult.secondaryKeywords.length > 0 ? rawResult.secondaryKeywords : fallback.secondaryKeywords,
          longTailKeywords: Array.isArray(rawResult.longTailKeywords) && rawResult.longTailKeywords.length > 0 ? rawResult.longTailKeywords : fallback.longTailKeywords,
          peopleAlsoAsk: Array.isArray(rawResult.peopleAlsoAsk) && rawResult.peopleAlsoAsk.length > 0 ? rawResult.peopleAlsoAsk : fallback.peopleAlsoAsk,
          titleTagIdeas: Array.isArray(rawResult.titleTagIdeas) && rawResult.titleTagIdeas.length > 0 ? rawResult.titleTagIdeas : fallback.titleTagIdeas,
          suggestedTags: Array.isArray(rawResult.suggestedTags) && rawResult.suggestedTags.length > 0 ? rawResult.suggestedTags : fallback.suggestedTags,
          faqSchema: Array.isArray(rawResult.faqSchema) && rawResult.faqSchema.length > 0 ? rawResult.faqSchema : fallback.faqSchema,
          contentOutline: Array.isArray(rawResult.contentOutline) && rawResult.contentOutline.length > 0 ? rawResult.contentOutline : fallback.contentOutline,
          rankingTips: Array.isArray(rawResult.rankingTips) && rawResult.rankingTips.length > 0 ? rawResult.rankingTips : fallback.rankingTips,
        };
      }
    }
  } catch (err) {
    console.warn('Network or server error during SEO research, using client fallback:', err);
  }

  // Graceful client fallback ensures Keyword Researcher NEVER fails for the user
  return buildClientFallbackSEOResult(cleanTopic, params.category);
}
