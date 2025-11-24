import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { MetaService } from '../../services/meta.service';

@Component({
    selector: 'app-privacy',
    templateUrl: './privacy.component.html',
    styleUrls: ['./privacy.component.scss'],
    standalone: false
})
export class PrivacyComponent implements OnInit, AfterViewInit {
  private observer!: IntersectionObserver;

  constructor(
    private languageService: LanguageService,
    private metaService: MetaService,
    private el: ElementRef,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.metaService.setPageMeta({
      title: 'Politique de Confidentialité | Aurélie Manier - Avocate',
      description: 'Politique de confidentialité et protection des données personnelles du cabinet d\'avocat Aurélie Manier à Lyon.',
      ogTitle: 'Politique de Confidentialité | Aurélie Manier - Avocate',
      ogDescription: 'Découvrez notre politique de confidentialité et la gestion de vos données personnelles.',
      ogImage: 'https://www.aurelie-manier.fr/assets/img/og-image.jpg',
      canonical: 'https://www.aurelie-manier.fr/politique-confidentialite'
    });
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });

    const blocs = this.el.nativeElement.querySelectorAll('.bloc');
    blocs.forEach((bloc: Element) => {
      this.observer.observe(bloc);
    });
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
