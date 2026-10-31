import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { Constants } from 'src/app/global/constant';
import { SupportedLanguages } from 'src/app/global/enum';
import { Article } from 'src/app/global/interfaces';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';
import { ArticleService } from '../article.service';
import { formatArticleDate } from '../format-date';

const AUTHOR = 'Aurélie Manier';
const STRUCTURED_DATA_ID = 'article-structured-data';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
  standalone: false
})
export class ArticleDetailComponent implements OnInit {
  lang: SupportedLanguages;
  article?: Article;
  date = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private languageService: LanguageService,
    private metaService: MetaService,
    private breadcrumbService: BreadcrumbService,
    private destroyRef: DestroyRef
  ) {
    this.lang = this.languageService.getCurrentLang();
    // Before the navigation ends, so the breadcrumb shows the title rather than the slug
    const slug = this.route.snapshot.paramMap.get('slug');
    const article = slug ? this.articleService.find(this.lang, slug) : undefined;
    if (article) {
      this.breadcrumbService.setPageLabel(`/${article.locale}/articles/${article.slug}`, article.title);
    }
  }

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.languageService.currentLang$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, lang]) => this.show(lang, params.get('slug') ?? ''));
  }

  private show(lang: SupportedLanguages, slug: string): void {
    this.lang = lang;
    const article = this.articleService.find(lang, slug);
    if (!article) {
      // Language switch on an article page: go to its translation, or to the list if there is none
      const translation = this.articleService.findTranslation(lang, slug);
      if (translation) {
        this.breadcrumbService.setPageLabel(`/${lang}/articles/${translation.slug}`, translation.title);
      }
      void this.router.navigate(translation ? ['/', lang, 'articles', translation.slug] : ['/', lang, 'articles'], { replaceUrl: true });
      return;
    }
    this.article = article;
    this.date = formatArticleDate(article.publishedAt, lang);
    this.breadcrumbService.setPageLabel(`/${lang}/articles/${article.slug}`, article.title);

    const url = (l: string, s: string) => `${Constants.HOSTNAME}/${l}/articles/${s}`;
    const alternates: Partial<Record<SupportedLanguages, string>> = { [lang]: url(lang, article.slug) };
    for (const [l, s] of Object.entries(article.translations)) {
      alternates[l as SupportedLanguages] = url(l, s);
    }
    const description = article.description || article.subtitle || article.title;
    this.metaService.setPageMeta({
      title: `${article.title} | ${AUTHOR}`,
      description,
      ogTitle: article.title,
      ogDescription: description,
      ogImage: article.image?.url ?? `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
      canonical: url(lang, article.slug),
      alternates,
    });
    this.metaService.setStructuredData(STRUCTURED_DATA_ID, {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': article.title,
      'description': description,
      'datePublished': article.publishedAt,
      'dateModified': article.updatedAt,
      'inLanguage': lang,
      'mainEntityOfPage': url(lang, article.slug),
      // @ids match the graph in src/index.html, so the article is attached to the lawyer and her firm
      'author': {
        '@type': 'Person',
        '@id': `${Constants.HOSTNAME}/#aurelie-manier`,
        'name': AUTHOR,
        'jobTitle': lang === SupportedLanguages.FR ? 'Avocate' : 'Lawyer',
        'url': `${Constants.HOSTNAME}/${lang}`,
      },
      'publisher': { '@id': `${Constants.HOSTNAME}/#cabinet` },
      ...(article.image ? { 'image': article.image.url } : {}),
    }, this.destroyRef);
  }
}
