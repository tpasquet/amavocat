import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Constants } from '../global/constant';
import { isSupportedLanguage } from '../utils/language';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

interface BreadcrumbKey {
  labelKey: string;
  url: string;
}

const HOME_LABEL_KEY = 'navbar.home';
const SEGMENT_LABEL_KEYS: Record<string, string> = {
  'domaines': 'navbar.domains',
  'contact': 'navbar.contact',
  'mentions-legales': 'footer.legal',
  'politique-confidentialite': 'footer.privacy',
};

const STRUCTURED_DATA_ID = 'breadcrumb-structured-data';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  /** Translated breadcrumbs of the current page, updated on navigation and language change. */
  readonly breadcrumbs$: Observable<BreadcrumbItem[]>;

  constructor(
    private router: Router,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.breadcrumbs$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects),
      startWith(this.router.url),
      map(url => this.buildBreadcrumbKeys(url)),
      // translate.stream() throws on an empty key list (e.g. "/" before the language redirect)
      switchMap(keys => keys.length === 0 ? of([]) : this.translate.stream(keys.map(k => k.labelKey)).pipe(
        map((labels: Record<string, string>) => keys.map(k => ({ label: labels[k.labelKey] ?? k.labelKey, url: k.url })))
      )),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    // Angular strips <script> tags from templates, so the JSON-LD is written to <head> here
    this.breadcrumbs$.subscribe(breadcrumbs => this.setStructuredData(breadcrumbs));
  }

  private buildBreadcrumbKeys(url: string): BreadcrumbKey[] {
    const [lang, ...segments] = url.split(/[?#]/)[0].split('/').filter(segment => segment);
    if (!isSupportedLanguage(lang)) {
      return [];
    }

    let currentUrl = `/${lang}`;
    const breadcrumbs: BreadcrumbKey[] = [{ labelKey: HOME_LABEL_KEY, url: currentUrl }];
    for (const segment of segments) {
      currentUrl += `/${segment}`;
      breadcrumbs.push({ labelKey: SEGMENT_LABEL_KEYS[segment] ?? segment, url: currentUrl });
    }
    return breadcrumbs;
  }

  private setStructuredData(breadcrumbs: BreadcrumbItem[]): void {
    this.document.getElementById(STRUCTURED_DATA_ID)?.remove();
    if (breadcrumbs.length < 2) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = STRUCTURED_DATA_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.label,
        'item': `${Constants.HOSTNAME}${crumb.url}`
      }))
    });
    this.document.head.appendChild(script);
  }
}
