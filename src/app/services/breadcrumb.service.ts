import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbs: BreadcrumbItem[] = [];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment);

    this.breadcrumbs = [
      { label: 'Accueil', url: '/' }
    ];

    // Build breadcrumbs based on URL segments
    let currentUrl = '';
    segments.forEach((segment, index) => {
      // Skip language segment
      if (index === 0 && (segment === 'fr' || segment === 'en')) {
        currentUrl += `/${segment}`;
        return;
      }

      currentUrl += `/${segment}`;
      const label = this.getSegmentLabel(segment);
      this.breadcrumbs.push({ label, url: currentUrl });
    });
  }

  private getSegmentLabel(segment: string): string {
    const labels: { [key: string]: string } = {
      'accueil': 'Accueil',
      'domaines': 'Domaines d\'expertise',
      'contact': 'Contact',
      'mentions-legales': 'Mentions légales',
      'politique-confidentialite': 'Politique de confidentialité',
      'posts': 'Articles',
      'fr': 'Français',
      'en': 'English'
    };
    return labels[segment] || segment;
  }

  getBreadcrumbs(): BreadcrumbItem[] {
    return this.breadcrumbs;
  }

  getStructuredData(): string {
    const itemListElement = this.breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.label,
      'item': `https://www.aurelie-manier.fr${crumb.url}`
    }));

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': itemListElement
    };

    return JSON.stringify(structuredData);
  }
}
