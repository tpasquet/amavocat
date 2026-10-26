import { Component, DestroyRef, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from '../../global/constant';
import { PageMetaTranslations } from '../../global/types';
import { LanguageService } from '../../services/language.service';
import { MetaService } from '../../services/meta.service';

const PrivacyMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Privacy Policy | Aurélie Manier - Lawyer',
    description: 'Privacy policy and personal data protection of the law office of Aurélie Manier in Lyon.',
    ogTitle: 'Privacy Policy | Aurélie Manier - Lawyer',
    ogDescription: 'Learn about our privacy policy and how your personal data is handled.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en/politique-confidentialite`
  },
  fr: {
    title: 'Politique de Confidentialité | Aurélie Manier - Avocate',
    description: 'Politique de confidentialité et protection des données personnelles du cabinet d\'avocat Aurélie Manier à Lyon.',
    ogTitle: 'Politique de Confidentialité | Aurélie Manier - Avocate',
    ogDescription: 'Découvrez notre politique de confidentialité et la gestion de vos données personnelles.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/fr/politique-confidentialite`
  }
};

@Component({
    selector: 'app-privacy',
    templateUrl: './privacy.component.html',
    styleUrls: ['./privacy.component.scss'],
    standalone: false
})
export class PrivacyComponent implements OnInit {

  constructor(
    private languageService: LanguageService,
    private metaService: MetaService,
    private viewportScroller: ViewportScroller,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.metaService.setPageMeta(PrivacyMetaTranslations[lang]));
  }

}
