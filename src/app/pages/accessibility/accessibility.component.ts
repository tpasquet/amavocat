import { Component, DestroyRef, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from '../../global/constant';
import { PageMetaTranslations } from '../../global/types';
import { LanguageService } from '../../services/language.service';
import { MetaService } from '../../services/meta.service';

const AccessibilityMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Accessibility | Aurélie Manier - Lawyer',
    description: 'Accessibility statement of the website of Aurélie Manier, lawyer in Lyon: compliance, known limitations and how to report a problem.',
    ogTitle: 'Accessibility | Aurélie Manier - Lawyer',
    ogDescription: 'Accessibility statement: compliance, known limitations and how to report a problem.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en/accessibilite`
  },
  fr: {
    title: 'Accessibilité | Aurélie Manier - Avocate',
    description: 'Déclaration d\'accessibilité du site de Maître Aurélie Manier, avocate à Lyon : conformité, limites connues et contact pour signaler un problème.',
    ogTitle: 'Accessibilité | Aurélie Manier - Avocate',
    ogDescription: 'Déclaration d\'accessibilité : conformité, limites connues et contact pour signaler un problème.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/fr/accessibilite`
  }
};

@Component({
    selector: 'app-accessibility',
    templateUrl: './accessibility.component.html',
    styleUrls: ['./accessibility.component.scss'],
    standalone: false
})
export class AccessibilityComponent implements OnInit {

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
      .subscribe(lang => this.metaService.setPageMeta(AccessibilityMetaTranslations[lang]));
  }
}
