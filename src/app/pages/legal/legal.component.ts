import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { LanguageService } from 'src/app/services/language.service';
import { MetaService } from 'src/app/services/meta.service';

@Component({
    selector: 'app-legal',
    templateUrl: './legal.component.html',
    styleUrls: ['./legal.component.scss'],
    standalone: false
})
export class LegalComponent implements OnInit {

  constructor(
    private languageService: LanguageService,
    private metaService: MetaService,
    private viewportScroller: ViewportScroller
  ) { }

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.metaService.setPageMeta({
      title: 'Mentions Légales | Aurélie Manier - Avocate',
      description: 'Mentions légales du cabinet d\'avocat Aurélie Manier à Lyon.',
      ogTitle: 'Mentions Légales | Aurélie Manier',
      ogDescription: 'Mentions légales du cabinet d\'avocat Aurélie Manier à Lyon.',
      ogImage: 'https://www.aurelie-manier.fr/assets/img/profile-picture-home.jpg',
      canonical: 'https://www.aurelie-manier.fr/mentions-legales'
    });
  }

}
