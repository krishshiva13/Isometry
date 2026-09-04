import { SEOAuditReport, SEOAuditCheckItem, SEOKeywordResearchResult, Fact } from '../types';

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
 * Calls the backend Gemini SEO Keyword Researcher endpoint
 */
export async function researchKeywordsWithAI(params: {
  topic: string;
  category?: string;
  targetAudience?: string;
}): Promise<SEOKeywordResearchResult> {
  const response = await fetch('/api/seo/research-keyword', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `SEO Keyword research failed (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data.result as SEOKeywordResearchResult;
}
