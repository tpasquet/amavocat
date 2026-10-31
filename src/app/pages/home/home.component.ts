import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from 'src/app/global/constant';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

const HomeMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Employment & Personal Injury Lawyer in Lyon | Aurélie Manier',
    description: 'Aurélie Manier, lawyer in Lyon: dismissal, workplace harassment, work accidents, occupational diseases and road accidents. At the office, by video or phone.',
    ogTitle: 'Employment & Personal Injury Lawyer in Lyon | Aurélie Manier',
    ogDescription: 'Aurélie Manier, lawyer in Lyon: dismissal, workplace harassment, work accidents, occupational diseases and road accidents. At the office, by video or phone.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en`
  },
  fr: {
    title: 'Avocate droit social et dommage corporel à Lyon | Aurélie Manier',
    description: 'Maître Aurélie Manier, avocate à Lyon 3e : licenciement, harcèlement, accident du travail, maladie professionnelle, accident de la route. Cabinet ou visio.',
    ogTitle: 'Avocate droit social et dommage corporel à Lyon | Aurélie Manier',
    ogDescription: 'Maître Aurélie Manier, avocate à Lyon 3e : licenciement, harcèlement, accident du travail, maladie professionnelle, accident de la route. Cabinet ou visio.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/fr`
  }
};

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {
  language: string;

  constructor(private languageService: LanguageService, private metaService: MetaService, private destroyRef: DestroyRef) {
    this.language = this.languageService.getCurrentLang();
  }

  ngOnInit() {
    // Le composant est réutilisé quand seule la langue change (/fr/x -> /en/x) : on suit la langue
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => {
        this.language = lang;
        this.metaService.setPageMeta(HomeMetaTranslations[lang]);
      });
  }

}
