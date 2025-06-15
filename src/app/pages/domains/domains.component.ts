import { Component } from '@angular/core';
import { Constants } from 'src/app/global/constant';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

const DomainMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Domains of Expertise | Aurélie Manier',
    description: 'Explore the domains of expertise offered by Aurélie Manier, a labor law lawyer in Lyon. Specializing in employment disputes, discrimination, harassment, and wage issues.',
    ogTitle: 'Domains of Expertise | Aurélie Manier',
    ogDescription: 'Explore the domains of expertise offered by Aurélie Manier, a labor law lawyer in Lyon. Specializing in employment disputes, discrimination, harassment, and wage issues.',
    canonical: `${Constants.HOSTNAME}/en/domains`
  },
  fr: {
    title: 'Domaines d\'Expertise | Aurélie Manier',
    description: 'Découvrez les domaines d\'expertise offerts par Aurélie Manier, avocate en droit du travail à Lyon. Spécialisée dans les litiges liés à l\'emploi, la discrimination, le harcèlement et les questions salariales.',
    ogTitle: 'Domaines d\'Expertise | Aurélie Manier',
    ogDescription: 'Découvrez les domaines d\'expertise offerts par Aurélie Manier, avocate en droit du travail à Lyon. Spécialisée dans les litiges liés à l\'emploi, la discrimination, le harcèlement et les questions salariales.',
    canonical: `${Constants.HOSTNAME}/fr/domains`
  }
};

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.scss']
})
export class DomainsComponent {
  constructor(private languageService: LanguageService, private metaService: MetaService) { }


  ngOnInit() {
    const lang = this.languageService.getCurrentLang();
    this.metaService.setPageMeta(DomainMetaTranslations[lang]);
  }
}
