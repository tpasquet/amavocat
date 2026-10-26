import { Component, DestroyRef, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from 'src/app/global/constant';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

const LegalMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Legal Notice | Aurélie Manier - Lawyer',
    description: 'Legal notice of the law office of Aurélie Manier in Lyon.',
    ogTitle: 'Legal Notice | Aurélie Manier',
    ogDescription: 'Legal notice of the law office of Aurélie Manier in Lyon.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en/mentions-legales`
  },
  fr: {
    title: 'Mentions Légales | Aurélie Manier - Avocate',
    description: 'Mentions légales du cabinet d\'avocat Aurélie Manier à Lyon.',
    ogTitle: 'Mentions Légales | Aurélie Manier',
    ogDescription: 'Mentions légales du cabinet d\'avocat Aurélie Manier à Lyon.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/fr/mentions-legales`
  }
};

@Component({
    selector: 'app-legal',
    templateUrl: './legal.component.html',
    styleUrls: ['./legal.component.scss'],
    standalone: false
})
export class LegalComponent implements OnInit {

  constructor(
    private languageService: LanguageService,
    private metaService: MetaService,
    private viewportScroller: ViewportScroller,
    private destroyRef: DestroyRef
  ) { }

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.metaService.setPageMeta(LegalMetaTranslations[lang]));
  }

}
