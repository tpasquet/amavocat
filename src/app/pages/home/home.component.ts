import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from 'src/app/global/constant';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

const HomeMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Social Law and Personal Injury Lawyer in Lyon | Aurélie Manier',
    description: 'Aurélie Manier is a social law and personal injury lawyer in Lyon with expertise in handling complex employment disputes, including discrimination, harassment, and wage and hour issues. Contact Aurélie Manier today for a consultation.',
    ogTitle: 'Social Law and Personal Injury Lawyer in Lyon | Aurélie Manier',
    ogDescription: 'Aurélie Manier is a social law and personal injury lawyer in Lyon with expertise in handling complex employment disputes, including discrimination, harassment, and wage and hour issues. Contact Aurélie Manier today for a consultation.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en`
  },
  fr: {
    title: 'Avocate en Droit Social et Dommage corporel à Lyon | Aurélie Manier',
    description: 'Aurélie Manier est une avocate en Droit Social et Dommage corporel à Lyon spécialisée dans la gestion de litiges complexes en matière d\'emploi, notamment la discrimination, le harcèlement et les problèmes de salaire et d\'heures. Contactez Aurélie Manier aujourd\'hui pour une consultation.',
    ogTitle: 'Avocate en Droit Social et Dommage corporel à Lyon | Aurélie Manier',
    ogDescription: 'Aurélie Manier est une avocate en Droit Social et Dommage corporel à Lyon spécialisée dans la gestion de litiges complexes en matière d\'emploi, notamment la discrimination, le harcèlement et les problèmes de salaire et d\'heures. Contactez Aurélie Manier aujourd\'hui pour une consultation.',
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

  constructor(private languageService: LanguageService, private metaService: MetaService, private destroyRef: DestroyRef) { }

  ngOnInit() {
    // Le composant est réutilisé quand seule la langue change (/fr/x -> /en/x) : on suit la langue
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.metaService.setPageMeta(HomeMetaTranslations[lang]));
  }

}
