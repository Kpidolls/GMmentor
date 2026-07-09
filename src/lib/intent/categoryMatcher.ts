import categoryKeywordsConfig from '../../config/categoryKeywords.json';

const CATEGORY_KEYWORDS = categoryKeywordsConfig.categoryKeywords as Record<string, string[]>;

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'for', 'to', 'near', 'in', 'around', 'with', 'me', 'best',
  'στο', 'στη', 'στα', 'για', 'κοντα', 'κοντά', 'με', 'και', 'σε',
]);

const normalizeText = (value: string): string => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s\u0370-\u03ff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const tokenize = (value: string): string[] => {
  return normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
};

const scoreKeywordAgainstQuery = (normalizedQuery: string, queryTokens: string[], keyword: string): number => {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return 0;

  // Support in-progress typing (e.g. "cof" -> "coffee")
  if (normalizedQuery.length >= 2 && normalizedKeyword.startsWith(normalizedQuery)) {
    return normalizedKeyword.includes(' ') ? 4 : 3;
  }

  if (normalizedQuery.length >= 3 && normalizedKeyword.includes(normalizedQuery)) {
    return 2;
  }

  if (normalizedQuery.includes(normalizedKeyword)) {
    return normalizedKeyword.includes(' ') ? 6 : 4;
  }

  const keywordTokens = tokenize(normalizedKeyword);
  if (keywordTokens.length === 0) return 0;

  let tokenMatches = 0;
  for (const token of keywordTokens) {
    if (queryTokens.includes(token)) {
      tokenMatches += 1;
    }
  }

  if (tokenMatches === 0) {
    // Partial token matching while typing (e.g. "brun" -> "brunch")
    let partialTokenMatches = 0;
    for (const queryToken of queryTokens) {
      if (queryToken.length < 2) continue;
      if (keywordTokens.some((keywordToken) => keywordToken.startsWith(queryToken))) {
        partialTokenMatches += 1;
      }
    }

    if (partialTokenMatches > 0) {
      return 1;
    }

    return 0;
  }

  if (keywordTokens.length > 1 && tokenMatches >= 2) {
    return 3;
  }

  return 1;
};

export interface CategoryQueryMatch {
  categoryId: string;
  score: number;
  matchedKeywords: string[];
}

export function detectCategoryMatches(query: string, maxResults = 5): CategoryQueryMatch[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const queryTokens = tokenize(normalizedQuery);
  if (queryTokens.length === 0) return [];

  const effectiveThreshold = normalizedQuery.length <= 3 ? 2 : 3;

  const matches: CategoryQueryMatch[] = [];

  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
      const keywordScore = scoreKeywordAgainstQuery(normalizedQuery, queryTokens, keyword);
      if (keywordScore > 0) {
        score += keywordScore;
        matchedKeywords.push(keyword);
      }
    }

    if (score >= effectiveThreshold) {
      matches.push({
        categoryId,
        score,
        matchedKeywords: matchedKeywords.slice(0, 5),
      });
    }
  }

  return matches
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.categoryId.localeCompare(right.categoryId);
    })
    .slice(0, maxResults);
}
