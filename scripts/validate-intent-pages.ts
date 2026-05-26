import { readFileSync } from 'fs';
import { join } from 'path';

import { loadEntitiesIndex } from '../src/lib/entities';
import { createIntentEngine } from '../src/lib/intent';

type QaIssue = {
  code:
    | 'missing_coverage_artifact'
    | 'missing_h1'
    | 'missing_canonical'
    | 'missing_jsonld'
    | 'invalid_area_route'
    | 'invalid_category_area_route'
    | 'duplicate_route';
  detail: string;
};

function hasText(content: string, needle: string): boolean {
  return content.toLowerCase().includes(needle.toLowerCase());
}

function validateTemplateMarkers(filePath: string, issues: QaIssue[]): void {
  const content = readFileSync(filePath, 'utf8');
  if (!hasText(content, '<Heading as="h1"')) {
    issues.push({ code: 'missing_h1', detail: `${filePath} is missing an h1 heading` });
  }
  if (!hasText(content, 'rel="canonical"')) {
    issues.push({ code: 'missing_canonical', detail: `${filePath} is missing a canonical link` });
  }
  if (!hasText(content, 'application/ld+json')) {
    issues.push({ code: 'missing_jsonld', detail: `${filePath} is missing JSON-LD output` });
  }
}

function main(): void {
  console.log('\n🧪 Validating intent pages...\n');

  const issues: QaIssue[] = [];
  const coveragePath = join(process.cwd(), 'public', 'data', 'intent-coverage.json');
  let coverage: {
    generatedAreaRoutes?: string[];
    generatedCategoryAreaRoutes?: Array<{ categorySlug: string; areaSlug: string }>;
  } | null = null;

  try {
    coverage = JSON.parse(readFileSync(coveragePath, 'utf8')) as {
      generatedAreaRoutes?: string[];
      generatedCategoryAreaRoutes?: Array<{ categorySlug: string; areaSlug: string }>;
    };
  } catch {
    issues.push({
      code: 'missing_coverage_artifact',
      detail: `${coveragePath} is missing. Run npm run report:intent-coverage first.`,
    });
  }

  validateTemplateMarkers(join(process.cwd(), 'src', 'pages', 'area', '[area].tsx'), issues);
  validateTemplateMarkers(join(process.cwd(), 'src', 'pages', '[category]', '[area].tsx'), issues);

  const index = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: index.entities });

  const areaRoutes = Array.isArray(coverage?.generatedAreaRoutes) ? coverage!.generatedAreaRoutes! : [];
  const categoryAreaRoutes = Array.isArray(coverage?.generatedCategoryAreaRoutes)
    ? coverage!.generatedCategoryAreaRoutes!
    : [];

  const seenArea = new Set<string>();
  for (const areaSlug of areaRoutes) {
    if (seenArea.has(areaSlug)) {
      issues.push({ code: 'duplicate_route', detail: `Duplicate area route: /area/${areaSlug}` });
      continue;
    }
    seenArea.add(areaSlug);

    const area = engine.areas.records.find((record) => record.urlSlug === areaSlug);
    if (!area) {
      issues.push({ code: 'invalid_area_route', detail: `Unknown area route /area/${areaSlug}` });
      continue;
    }

    const payload = engine.query.getIntentResults({ areaId: area.id });
    if (!payload || !payload.passesThreshold || payload.entities.length === 0) {
      issues.push({
        code: 'invalid_area_route',
        detail: `Area route /area/${areaSlug} does not meet threshold or has no results`,
      });
    }
  }

  const seenCategoryArea = new Set<string>();
  for (const route of categoryAreaRoutes) {
    const key = `${route.categorySlug}/${route.areaSlug}`;
    if (seenCategoryArea.has(key)) {
      issues.push({ code: 'duplicate_route', detail: `Duplicate category-area route: /${key}` });
      continue;
    }
    seenCategoryArea.add(key);

    const resolution = engine.resolver.resolveIntent(route.categorySlug, route.areaSlug);
    if (resolution.status !== 'resolved' || !resolution.categoryId || !resolution.areaId) {
      issues.push({
        code: 'invalid_category_area_route',
        detail: `Unresolvable category-area route: /${key}`,
      });
      continue;
    }

    const category = engine.categories.byId.get(resolution.categoryId);
    const area = engine.areas.byId.get(resolution.areaId);
    if (!category || !area) {
      issues.push({
        code: 'invalid_category_area_route',
        detail: `Invalid canonical mapping for route: /${key}`,
      });
      continue;
    }

    if (category.urlSlug !== route.categorySlug || area.urlSlug !== route.areaSlug) {
      issues.push({
        code: 'invalid_category_area_route',
        detail: `Route is not canonical: /${key}`,
      });
      continue;
    }

    const payload = engine.query.getIntentResults({
      categoryId: category.id,
      areaId: area.id,
    });

    if (!payload || !payload.passesThreshold || payload.entities.length === 0) {
      issues.push({
        code: 'invalid_category_area_route',
        detail: `Route /${key} fails threshold or has no entities`,
      });
    }
  }

  if (issues.length === 0) {
    console.log('✅ Intent page validation passed.\n');
    return;
  }

  const grouped = new Map<QaIssue['code'], string[]>();
  for (const issue of issues) {
    const bucket = grouped.get(issue.code) ?? [];
    bucket.push(issue.detail);
    grouped.set(issue.code, bucket);
  }

  for (const [code, details] of grouped.entries()) {
    console.error(`❌ ${code}: ${details.length}`);
    for (const detail of details) {
      console.error(`   - ${detail}`);
    }
  }

  console.error(`\nIntent page validation failed with ${issues.length} issue(s).\n`);
  process.exitCode = 1;
}

main();
