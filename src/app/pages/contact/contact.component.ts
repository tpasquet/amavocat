import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from 'src/app/global/constant';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

const HomeMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Contact Aurélie Manier, Social Law and Personal Injury Attorney in Lyon',
    description: 'Looking for a social law and personal injury attorney in Lyon? Contact Aurélie Manier for a confidential and effective legal consultation. Get help with your employment and employer-employee relationship issues.',
    ogTitle: 'Contact Aurélie Manier, Social Law and Personal Injury Attorney in Lyon',
    ogDescription: 'Looking for a social law and personal injury attorney in Lyon? Contact Aurélie Manier for a confidential and effective legal consultation. Get help with your employment and employer-employee relationship issues.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en/contact`
  },
  fr: {
    title: 'Contactez Aurélie Manier, Avocate en Droit Social et Dommage corporel à Lyon',
    description: 'Besoin d\'un avocat en Droit Social et Dommage corporel à Lyon ? Contactez Aurélie Manier pour une consultation juridique confidentielle et efficace. Obtenez de l\'aide pour vos problèmes de travail et de relations employeur-employé.',
    ogTitle: 'Contactez Aurélie Manier, Avocate en Droit Social et Dommage corporel à Lyon',
    ogDescription: 'Besoin d\'un avocat en Droit Social et Dommage corporel à Lyon ? Contactez Aurélie Manier pour une consultation juridique confidentielle et efficace. Obtenez de l\'aide pour vos problèmes de travail et de relations employeur-employé.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/fr/contact`
  }
};
@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss'],
    standalone: false
})
export class ContactComponent {

  xSmall = false;
  small = false;
  
  constructor(private languageService: LanguageService, private metaService: MetaService, private destroyRef: DestroyRef, private responsive: BreakpointObserver) {
    this.responsive.observe([
      Breakpoints.Small,
      Breakpoints.XSmall,
    ])
      .subscribe(result => {
        if (result.matches) {
          this.xSmall = true;
          this.small = true;
        } else {
          this.xSmall = true;
          this.small = true;
        }
      });
  }

  ngOnInit() {
    // Le composant est réutilisé quand seule la langue change (/fr/x -> /en/x) : on suit la langue
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.metaService.setPageMeta(HomeMetaTranslations[lang]));
  }
}
