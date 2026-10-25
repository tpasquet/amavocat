import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from 'src/app/global/constant';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

const DomainMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Domains of Expertise | Aurélie Manier',
    description: 'Explore the domains of expertise offered by Aurélie Manier, a social law and personal injury lawyer in Lyon. Specializing in employment disputes, discrimination, harassment, and wage issues.',
    ogTitle: 'Domains of Expertise | Aurélie Manier',
    ogDescription: 'Explore the domains of expertise offered by Aurélie Manier, a social law and personal injury lawyer in Lyon. Specializing in employment disputes, discrimination, harassment, and wage issues.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en/domaines`
  },
  fr: {
    title: 'Domaines d\'Expertise | Aurélie Manier',
    description: 'Découvrez les domaines d\'expertise offerts par Aurélie Manier, avocate en Droit Social et Dommage corporel à Lyon. Spécialisée dans les litiges liés à l\'emploi, la discrimination, le harcèlement et les questions salariales.',
    ogTitle: 'Domaines d\'Expertise | Aurélie Manier',
    ogDescription: 'Découvrez les domaines d\'expertise offerts par Aurélie Manier, avocate en Droit Social et Dommage corporel à Lyon. Spécialisée dans les litiges liés à l\'emploi, la discrimination, le harcèlement et les questions salariales.',
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
