import { Injectable } from '@angular/core';
import articles from '../../../../generated/articles.json';
import { SupportedLanguages } from 'src/app/global/enum';
import { Article } from 'src/app/global/interfaces';

/**
 * Published articles, fetched from the backoffice API when the site is built (scripts/fetch-content.mts)
 * and bundled into this lazy module: pages are prerendered with their content and need no request.
 */
@Injectable()
export class ArticleService {
  private readonly articles = articles as Article[];

  /** Newest first */
  list(lang: SupportedLanguages): Article[] {
    return this.articles.filter(article => article.locale === lang);
  }

  find(lang: SupportedLanguages, slug: string): Article | undefined {
    return this.articles.find(article => article.locale === lang && article.slug === slug);
  }

  /**
   * The article another language's slug points to in `lang`, if it was translated: used when the
   * visitor switches language on an article page (the slug in the URL is the other language's).
   */
  findTranslation(lang: SupportedLanguages, foreignSlug: string): Article | undefined {
    const source = this.articles.find(article => article.locale !== lang && article.slug === foreignSlug);
    const slug = source?.translations[lang];
    return slug ? this.find(lang, slug) : undefined;
  }
}
