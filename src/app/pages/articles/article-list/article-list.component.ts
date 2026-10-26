import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from 'src/app/global/constant';
import { SupportedLanguages } from 'src/app/global/enum';
import { Article } from 'src/app/global/interfaces';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';
import { ArticleService } from '../article.service';

const ArticlesMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Articles | Aurélie Manier - Lawyer in Lyon',
    description: 'Articles by Aurélie Manier, lawyer in Lyon, on employment law, social security law and personal injury.',
    ogTitle: 'Articles | Aurélie Manier',
    ogDescription: 'Articles on employment law, social security law and personal injury.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en/articles`
  },
  fr: {
    title: 'Articles | Aurélie Manier - Avocate à Lyon',
    description: 'Articles de Maître Aurélie Manier, avocate à Lyon, en droit du travail, droit de la sécurité sociale et dommage corporel.',
    ogTitle: 'Articles | Aurélie Manier',
    ogDescription: 'Articles en droit du travail, droit de la sécurité sociale et dommage corporel.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/fr/articles`
  }
};

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
  standalone: false
})
export class ArticleListComponent implements OnInit {
  lang: SupportedLanguages;
  articles: Article[] = [];

  constructor(
    private articleService: ArticleService,
    private languageService: LanguageService,
    private metaService: MetaService,
    private destroyRef: DestroyRef
  ) {
    this.lang = this.languageService.getCurrentLang();
  }

  ngOnInit(): void {
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => {
        this.lang = lang;
        this.articles = this.articleService.list(lang);
        this.metaService.setPageMeta(ArticlesMetaTranslations[lang]);
      });
  }

  trackById(_index: number, article: Article): string {
    return article.id;
  }
}
