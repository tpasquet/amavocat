/**
 * Fetches the published content from the backoffice API before the site is built, and writes it to
 * generated/ (git-ignored):
 * - articles.json: published articles of every locale, imported by the lazy articles module
 * - articles-meta.json: number of articles per locale, used by the navigation
 * - prerender-routes.txt: prerender-routes.txt plus one route per article
 * - sitemap.xml: src/sitemap.xml plus the article pages
 *
 * CONTENT_API_URL (e.g. https://api.aureliemanier-avocat.fr/api) selects the API. Without it the site is
 * built with no articles. With it, any error fails the build, so a deploy never removes articles because
 * the API was briefly unreachable.
 *
 * Runs with Node's built-in TypeScript support (Node 22.18+).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'generated');
const hostname = 'https://aureliemanier-avocat.fr';
const locales = ['fr', 'en'] as const;
type Locale = (typeof locales)[number];

interface ApiEntry {
  id: string;
  locale: Locale;
  translationGroup: string;
  slug: string;
  publishAt: string;
  updatedAt: string;
  data: {
    title: string;
    subtitle?: string;
    description?: string;
    body: string;
    tags?: string[];
    featuredImage?: { url: string; alt: string };
  };
}

/** Must match src/app/global/interfaces.ts (Article) */
interface Article {
  id: string;
  locale: Locale;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  title: string;
  subtitle: string;
  description: string;
  body: string;
  tags: string[];
  image: { url: string; alt: string } | null;
  /** Slug of this article in the other locales */
  translations: Partial<Record<Locale, string>>;
}

async function fetchEntries(apiUrl: string): Promise<ApiEntry[]> {
  const url = `${apiUrl.replace(/\/+$/, '')}/public/entries/article`;
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    throw new Error(`GET ${url} answered ${response.status}`);
  }
  const body = (await response.json()) as { entries: ApiEntry[] };
  return body.entries;
}

function toArticles(entries: ApiEntry[]): Article[] {
  const byGroup = new Map<string, ApiEntry[]>();
  for (const entry of entries) {
    byGroup.set(entry.translationGroup, [...(byGroup.get(entry.translationGroup) ?? []), entry]);
  }
  return entries
    .filter((entry) => locales.includes(entry.locale))
    .map((entry) => ({
      id: entry.id,
      locale: entry.locale,
      slug: entry.slug,
      publishedAt: entry.publishAt,
      updatedAt: entry.updatedAt,
      title: entry.data.title,
      subtitle: entry.data.subtitle ?? '',
      description: entry.data.description ?? '',
      body: entry.data.body,
      tags: entry.data.tags ?? [],
      image: entry.data.featuredImage ?? null,
      translations: Object.fromEntries(
        (byGroup.get(entry.translationGroup) ?? [])
          .filter((other) => other.id !== entry.id)
          .map((other) => [other.locale, other.slug]),
      ),
    }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function articleUrl(article: Pick<Article, 'locale' | 'slug'>): string {
  return `/${article.locale}/articles/${article.slug}`;
}

function prerenderRoutes(articles: Article[]): string {
  const base = readFileSync(join(root, 'prerender-routes.txt'), 'utf8').trim().split('\n');
  const lists = locales.filter((l) => articles.some((a) => a.locale === l)).map((l) => `/${l}/articles`);
  return [...base, ...lists, ...articles.map(articleUrl)].join('\n') + '\n';
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sitemap(articles: Article[]): string {
  const base = readFileSync(join(root, 'src/sitemap.xml'), 'utf8');
  const urls: string[] = [];
  for (const locale of locales) {
    const own = articles.filter((a) => a.locale === locale);
    if (own.length === 0) continue;
    const lastmod = own.map((a) => a.updatedAt).sort().at(-1)!.slice(0, 10);
    urls.push(`  <url>\n    <loc>${hostname}/${locale}/articles</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
  }
  for (const article of articles) {
    const alternates = [[article.locale, article.slug], ...Object.entries(article.translations)]
      .map(([locale, slug]) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${hostname}/${locale}/articles/${slug}`)}"/>`)
      .join('\n');
    urls.push(
      `  <url>\n    <loc>${escapeXml(hostname + articleUrl(article))}</loc>\n    <lastmod>${article.updatedAt.slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n${alternates}\n  </url>`,
    );
  }
  if (urls.length === 0) return base;
  return base.replace('</urlset>', `\n  <!-- Articles (generated at build time) -->\n${urls.join('\n\n')}\n\n</urlset>`);
}

async function main() {
  const apiUrl = process.env['CONTENT_API_URL'];
  let articles: Article[] = [];
  if (apiUrl) {
    articles = toArticles(await fetchEntries(apiUrl));
    console.log(`Fetched ${articles.length} published article(s) from ${apiUrl}`);
  } else {
    console.log('CONTENT_API_URL is not set: building without articles');
  }

  mkdirSync(outDir, { recursive: true });
  const meta = Object.fromEntries(locales.map((l) => [l, articles.filter((a) => a.locale === l).length]));
  writeFileSync(join(outDir, 'articles.json'), JSON.stringify(articles, null, 2) + '\n');
  writeFileSync(join(outDir, 'articles-meta.json'), JSON.stringify(meta) + '\n');
  writeFileSync(join(outDir, 'prerender-routes.txt'), prerenderRoutes(articles));
  writeFileSync(join(outDir, 'sitemap.xml'), sitemap(articles));
}

main().catch((error: unknown) => {
  console.error(`Could not fetch the site content: ${(error as Error).message}`);
  process.exit(1);
});
