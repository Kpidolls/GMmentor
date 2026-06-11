import { getStaticProps } from '../src/pages/index';
import { loadEntitiesIndex } from '../src/lib/entities';
import { createIntentEngine } from '../src/lib/intent';
import { getAllPosts } from '../src/lib/posts';

type HubLink = {
  href: string;
  label: string;
  count?: number;
};

type HomeProps = {
  topAreaLinks: HubLink[];
  topListLinks: HubLink[];
  topGuideLinks: HubLink[];
};

function hasUniqueHrefs(links: HubLink[]): boolean {
  const set = new Set(links.map((link) => link.href));
  return set.size === links.length;
}

async function main(): Promise<void> {
  console.log('\n🧪 Validating homepage hub links...\n');

  const result = await getStaticProps({} as never);
  if (!('props' in result) || !result.props) {
    throw new Error('Homepage getStaticProps did not return props.');
  }

  const props = result.props as HomeProps;
  const errors: string[] = [];

  const index = loadEntitiesIndex();
  const engine = createIntentEngine({ entities: index.entities });
  const posts = getAllPosts();
  const postSlugs = new Set(posts.map((post) => post.slug));

  if (!Array.isArray(props.topAreaLinks) || props.topAreaLinks.length === 0) {
    errors.push('topAreaLinks is empty or missing.');
  }
  if (!Array.isArray(props.topListLinks) || props.topListLinks.length === 0) {
    errors.push('topListLinks is empty or missing.');
  }
  if (!Array.isArray(props.topGuideLinks) || props.topGuideLinks.length === 0) {
    errors.push('topGuideLinks is empty or missing.');
  }

  if (!hasUniqueHrefs(props.topAreaLinks)) {
    errors.push('topAreaLinks contains duplicate href values.');
  }
  if (!hasUniqueHrefs(props.topListLinks)) {
    errors.push('topListLinks contains duplicate href values.');
  }
  if (!hasUniqueHrefs(props.topGuideLinks)) {
    errors.push('topGuideLinks contains duplicate href values.');
  }

  for (const link of props.topAreaLinks) {
    const match = /^\/area\/([^/?#]+)$/.exec(link.href);
    if (!match) {
      errors.push(`Invalid area href format: ${link.href}`);
      continue;
    }

    const areaSlug = match[1] as string;
    const area = engine.resolver.resolveArea(areaSlug);
    if (!area) {
      errors.push(`Unresolvable area href: ${link.href}`);
      continue;
    }

    const payload = engine.query.getIntentResults({ areaId: area.id, limit: 1 });
    if (!payload || !payload.passesThreshold) {
      errors.push(`Area href does not pass threshold: ${link.href}`);
      continue;
    }

    if (typeof link.count === 'number' && link.count !== payload.counts.totalInArea) {
      errors.push(
        `Area count mismatch for ${link.href}: homepage=${link.count}, expected=${payload.counts.totalInArea}`
      );
    }
  }

  for (const link of props.topListLinks) {
    const match = /^\/([^/?#]+)\/([^/?#]+)$/.exec(link.href);
    if (!match) {
      errors.push(`Invalid list href format: ${link.href}`);
      continue;
    }

    const categorySlug = match[1] as string;
    const areaSlug = match[2] as string;
    const resolution = engine.resolver.resolveIntent(categorySlug, areaSlug);
    if (resolution.status !== 'resolved' || !resolution.category || !resolution.area) {
      errors.push(`Unresolvable list href: ${link.href}`);
      continue;
    }

    const payload = engine.query.getIntentResults({
      categoryId: resolution.category.id,
      areaId: resolution.area.id,
      limit: 1,
    });

    if (!payload || !payload.passesThreshold || payload.entities.length === 0) {
      errors.push(`List href does not pass threshold: ${link.href}`);
      continue;
    }

    if (typeof link.count === 'number' && link.count !== payload.counts.totalCategoryArea) {
      errors.push(
        `List count mismatch for ${link.href}: homepage=${link.count}, expected=${payload.counts.totalCategoryArea}`
      );
    }
  }

  for (const link of props.topGuideLinks) {
    const match = /^\/blog\/([^/?#]+)$/.exec(link.href);
    if (!match) {
      errors.push(`Invalid guide href format: ${link.href}`);
      continue;
    }

    const slug = match[1] as string;
    if (!postSlugs.has(slug)) {
      errors.push(`Guide href references missing post slug: ${link.href}`);
    }
  }

  if (errors.length > 0) {
    console.error('❌ Homepage hub link validation failed:');
    for (const error of errors) {
      console.error(`   - ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('✅ Homepage hub link validation passed.\n');
}

void main();