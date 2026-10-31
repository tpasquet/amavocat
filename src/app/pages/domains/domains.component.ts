import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from 'src/app/global/constant';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

const DomainMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Dismissal, Harassment, Work Accidents | Lawyer in Lyon',
    description: 'Employment disputes and dismissal, harassment, unfitness for work, work and road accidents, occupational diseases, social security disputes in Lyon.',
    ogTitle: 'Dismissal, Harassment, Work Accidents | Lawyer in Lyon',
    ogDescription: 'Employment disputes and dismissal, harassment, unfitness for work, work and road accidents, occupational diseases, social security disputes in Lyon.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en/domaines`
  },
  fr: {
    title: 'Licenciement, harcèlement, accident du travail | Avocate Lyon',
    description: 'Litiges du travail et licenciement, harcèlement, inaptitude, accidents du travail et de la route, maladies professionnelles, litiges avec la Sécurité sociale.',
    ogTitle: 'Licenciement, harcèlement, accident du travail | Avocate Lyon',
    ogDescription: 'Litiges du travail et licenciement, harcèlement, inaptitude, accidents du travail et de la route, maladies professionnelles, litiges avec la Sécurité sociale.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/fr/domaines`
  }
};

@Component({
    selector: 'app-domains',
    templateUrl: './domains.component.html',
    styleUrls: ['./domains.component.scss'],
    standalone: false
})
export class DomainsComponent implements OnInit {

  constructor(private languageService: LanguageService, private metaService: MetaService, private destroyRef: DestroyRef) { }

  ngOnInit() {
    // Le composant est réutilisé quand seule la langue change (/fr/x -> /en/x) : on suit la langue
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.metaService.setPageMeta(DomainMetaTranslations[lang]));
  }
}
