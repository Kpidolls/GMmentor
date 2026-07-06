import { readFileSync } from 'fs';
import { join } from 'path';

import {
  buildAreaMetaDescription,
  buildCategoryAreaMetaDescription,
  buildDestinationMetaDescription,
  buildPlaceMetaDescription,
  generateBlogMetaDescription,
  getBlogMetaDescriptionBySlug,
  getStaticMetaDescription,
  normalizeMetaDescription,
} from '../src/config/metaDescriptions';
import { buildEntitySeoSignature, loadEntitiesIndex, type EntityRecord } from '../src/lib/entities';
import { createIntentEngine } from '../src/lib/intent';
import { getAllPosts } from '../src/lib/posts';

type RouteMeta = {
  route: string;
  family: string;
  description: string;
  indexable: boolean;
  allowDuplicate: boolean;
};

type LocaleTree = Record<string, unknown>;

type DestinationEntry = {
  id: string;
  title: string;
  description: string;
};

const SHORT_DESCRIPTION_THRESHOLD = 110;
const DUPLICATE_ALLOWLIST = new Set(['/login', '/privacy-policy', '/terms', '/signup']);

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function getNestedValue(input: LocaleTree, dottedPath: string): string | undefined {
  return dottedPath.split('.').reduce<unknown>((value, segment) => {
    if (!value || typeof value !== 'object') {
      return undefined;
    }
    return (value as LocaleTree)[segment];
  }, input) as string | undefined;
}

function displayContext(entity: EntityRecord): string {
  if (entity.address) return entity.address;
  if (entity.region) return entity.region;
  if (entity.kind === 'municipality' && entity.region_en) return entity.region_en;
  return 'Greece';
}

function kindLabel(entity: EntityRecord): string {
  if (entity.kind === 'restaurant') return 'Restaurant';
  if (entity.kind === 'municipality') return 'Municipality';
  if (entity.kind === 'attraction') return 'Tourist Attraction';
  return 'Local Place';
}

function addRoute(
  routes: RouteMeta[],
  route: string,
  family: string,
  description: string,
  indexable = true
): void {
  routes.push({
    route,
    family,
    description: normalizeMetaDescription(description),
    indexable,
    allowDuplicate: DUPLICATE_ALLOWLIST.has(route),
  });
}

function main(): void {
  const root = process.cwd();
  const locales = {
    en: readJsonFile<LocaleTree>(join(root, 'src', 'i18n', 'locales', 'en.json')),
    el: readJsonFile<LocaleTree>(join(root, 'src', 'i18n', 'locales', 'el.json')),
  };
  const destinations = readJsonFile<DestinationEntry[]>(join(root, 'src', 'data', 'islands.json'));
  const entities = loadEntitiesIndex().entities;
  const engine = createIntentEngine({ entities });
  const posts = getAllPosts();
  const routes: RouteMeta[] = [];

  addRoute(routes, '/', 'home', getStaticMetaDescription('home', 'en'));
  addRoute(routes, '/search', 'static', getStaticMetaDescription('search', 'en'));
  addRoute(routes, '/store', 'static', getStaticMetaDescription('store', 'en'));
  addRoute(routes, '/blog', 'static', getStaticMetaDescription('blog', 'en'));
  addRoute(routes, '/insurance', 'static', getStaticMetaDescription('insurance', 'en'));
  addRoute(routes, '/airalo', 'static', getStaticMetaDescription('airalo', 'en'));
  addRoute(routes, '/privacy-policy', 'legal', getStaticMetaDescription('privacyPolicy', 'en'));
  addRoute(routes, '/terms', 'legal', getStaticMetaDescription('terms', 'en'));
  addRoute(routes, '/signup', 'auth', getStaticMetaDescription('signup', 'en'));
  addRoute(routes, '/login', 'auth', getStaticMetaDescription('login', 'en'), false);

  for (const destination of destinations) {
    const destinationName = getNestedValue(locales.en, destination.title) || destination.id;
    const destinationSummary =
      getNestedValue(locales.en, destination.description) ||
      'Curated points of interest, local favorites, and practical map guidance for your destination in Greece.';

    addRoute(
      routes,
      `/destination/${encodeURIComponent(destination.id)}`,
      'destination',
      buildDestinationMetaDescription({
        destinationName,
        summary: destinationSummary,
        language: 'en',
      })
    );
  }

  for (const area of engine.areas.records) {
    const payload = engine.query.getIntentResults({ areaId: area.id, limit: 30, relatedLimit: 10 });
    if (!payload || !payload.passesThreshold || payload.entities.length === 0) {
      continue;
    }

    addRoute(
      routes,
      `/area/${area.urlSlug}`,
      'area',
      buildAreaMetaDescription({
        areaName: area.nameEn || area.name,
        regionName: area.regionEn || area.region,
        count: payload.counts.totalInArea,
      })
    );
  }

  for (const category of engine.categories.records) {
    for (const area of engine.areas.records) {
      const payload = engine.query.getIntentResults({
        categoryId: category.id,
        areaId: area.id,
        limit: 30,
        relatedLimit: 10,
      });

      if (!payload || !payload.passesThreshold || !payload.category || payload.entities.length === 0) {
        continue;
      }

      addRoute(
        routes,
        `/${category.urlSlug}/${area.urlSlug}`,
        'category-area',
        buildCategoryAreaMetaDescription({
          categoryName: category.name,
          areaName: area.nameEn || area.name,
          regionName: area.regionEn || area.region,
          count: payload.counts.totalCategoryArea,
        })
      );
    }
  }

  for (const entity of entities.filter((record) => Boolean(record.slug))) {
    const seoSignature = buildEntitySeoSignature(entity);
    const canonicalEntity = entities
      .filter((candidate) => buildEntitySeoSignature(candidate) === seoSignature)
      .sort((left, right) => left.slug.localeCompare(right.slug))[0] || entity;

    addRoute(
      routes,
      `/place/${entity.slug}`,
      'place',
      buildPlaceMetaDescription({
        placeName: entity.name,
        context: displayContext(entity),
        typeLabel: kindLabel(entity),
        categoryLabel: entity.categories?.find(Boolean),
      }),
      canonicalEntity.slug === entity.slug
    );
  }

  for (const post of posts) {
    addRoute(
      routes,
      `/blog/${post.slug}`,
      'blog-post',
      getBlogMetaDescriptionBySlug(post.slug) ||
        generateBlogMetaDescription(post.title, post.summary, post.content, post.language)
    );
  }

  const duplicates = new Map<string, RouteMeta[]>();
  for (const route of routes) {
    if (!route.indexable) {
      continue;
    }
    const existing = duplicates.get(route.description) || [];
    existing.push(route);
    duplicates.set(route.description, existing);
  }

  const duplicateViolations = Array.from(duplicates.entries())
    .map(([description, cluster]) => ({ description, cluster }))
    .filter(({ cluster }) => cluster.length > 1 && cluster.some((entry) => !entry.allowDuplicate));

  const shortDescriptions = routes
    .filter((route) => route.indexable && !route.allowDuplicate && route.description.length < SHORT_DESCRIPTION_THRESHOLD)
    .sort((left, right) => left.description.length - right.description.length);

  console.log(`Validated ${routes.length} route descriptions across ${new Set(routes.map((route) => route.family)).size} route families.`);

  if (shortDescriptions.length > 0) {
    console.log(`Found ${shortDescriptions.length} short descriptions under ${SHORT_DESCRIPTION_THRESHOLD} characters:`);
    for (const route of shortDescriptions.slice(0, 20)) {
      console.log(`  - ${route.route} (${route.description.length} chars)`);
    }
  }

  if (duplicateViolations.length > 0) {
    console.error('Duplicate meta description violations found:');
    for (const violation of duplicateViolations) {
      console.error(`\nDescription: ${violation.description}`);
      for (const route of violation.cluster) {
        console.error(`  - ${route.route} [${route.family}]`);
      }
    }
    process.exitCode = 1;
    return;
  }

  console.log('No duplicate indexable meta descriptions found.');
}

main();