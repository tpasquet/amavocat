import { Component } from '@angular/core';
import { Constants } from 'src/app/global/constant';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

const HomeMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Contact Aurélie Manier, Employment Law Attorney in Lyon',
    description: 'Looking for an employment law attorney in Lyon? Contact Aurélie Manier for a confidential and effective legal consultation. Get help with your employment and employer-employee relationship issues.',
    ogTitle: 'Contact Aurélie Manier, Employment Law Attorney in Lyon',
    ogDescription: 'Looking for an employment law attorney in Lyon? Contact Aurélie Manier for a confidential and effective legal consultation. Get help with your employment and employer-employee relationship issues.',
    canonical: `${Constants.HOSTNAME}/en/contact`
  },
  fr: {
    title: 'Contactez Aurélie Manier, Avocate en Droit du Travail à Lyon',
    description: 'Besoin d\'un avocat en droit du travail à Lyon ? Contactez Aurélie Manier pour une consultation juridique confidentielle et efficace. Obtenez de l\'aide pour vos problèmes de travail et de relations employeur-employé.',
    ogTitle: 'Contactez Aurélie Manier, Avocate en Droit du Travail à Lyon',
    ogDescription: 'Besoin d\'un avocat en droit du travail à Lyon ? Contactez Aurélie Manier pour une consultation juridique confidentielle et efficace. Obtenez de l\'aide pour vos problèmes de travail et de relations employeur-employé.',
    canonical: `${Constants.HOSTNAME}/fr/contact`
  }
};
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {

  constructor(private languageService: LanguageService, private metaService: MetaService) { }

  ngOnInit() {
    const lang = this.languageService.getCurrentLang();
    this.metaService.setPageMeta(HomeMetaTranslations[lang]);
    
  }
}
