import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Constants } from 'src/app/global/constant';
import { PageMetaTranslations } from 'src/app/global/types';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

const HomeMetaTranslations: PageMetaTranslations = {
  en: {
    title: 'Labor Law Lawyer in Lyon | Aurélie Manier',
    description: 'Aurélie Manier is a labor law lawyer in New York with expertise in handling complex employment disputes, including discrimination, harassment, and wage and hour issues. Contact Aurélie Manier today for a consultation.',
    ogTitle: 'Labor Law Lawyer in Lyon | Aurélie Manier',
    ogDescription: 'Aurélie Manier is a labor law lawyer in New York with expertise in handling complex employment disputes, including discrimination, harassment, and wage and hour issues. Contact Aurélie Manier today for a consultation.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/en/home`
  },
  fr: {
    title: 'Avocate Droit du Travail à Lyon | Aurélie Manier',
    description: 'Aurélie Manier est une avocate en droit du travail à Lyon spécialisée dans la gestion de litiges complexes en matière d\'emploi, notamment la discrimination, le harcèlement et les problèmes de salaire et d\'heures. Contactez Aurélie Manier aujourd\hui pour une consultation.',
    ogTitle: 'Avocate Droit du Travail à Lyon | Aurélie Manier',
    ogDescription: 'Aurélie Manier est une avocate en droit du travail à Lyon spécialisée dans la gestion de litiges complexes en matière d\'emploi, notamment la discrimination, le harcèlement et les problèmes de salaire et d\'heures. Contactez Aurélie Manier aujourd\hui pour une consultation.',
    ogImage: `${Constants.HOSTNAME}/assets/img/profile-picture-home.jpg`,
    canonical: `${Constants.HOSTNAME}/fr/home`
  }
};

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit, AfterViewInit {
  private observer!: IntersectionObserver;

  constructor(private languageService: LanguageService, private metaService: MetaService) { }

  ngOnInit() {
    const lang = this.languageService.getCurrentLang();
    this.metaService.setPageMeta(HomeMetaTranslations[lang]);
  }

  ngAfterViewInit() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const blocs = document.querySelectorAll('.bloc');
    blocs.forEach(bloc => this.observer.observe(bloc));
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

}
