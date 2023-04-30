import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PageMeta } from '../global/interfaces';

@Injectable({
    providedIn: 'root'
})
export class MetaService {

    constructor(private title: Title, private metaService: Meta, private router: Router) { }

    setPageMeta(data: PageMeta): void {
        this.title.setTitle(data.title);
        this.metaService.updateTag({ name: 'description', content: data.description });
        this.metaService.updateTag({ name: 'og:title', content: data.ogTitle });
        this.metaService.updateTag({ name: 'og:description', content: data.ogDescription });
        this.setCanonicalUrl(data.canonical);

        // FIXME - Set the language-specific meta tags
        // Set the common meta tags for both languages
        // this.metaService.updateTag({ name: 'keywords', content: 'your, keywords, here' });
        // this.metaService.updateTag({ name: 'author', content: 'Your Name' });
        // this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
        // this.metaService.updateTag({ name: 'googlebot', content: 'index, follow' });
        // this.metaService.updateTag({ name: 'canonical', content: 'http://www.example.com/page.html' });
        // this.metaService.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1.0' });
    }

    setCanonicalUrl(url: string) {
        const linkTag = document.querySelector('link[rel="canonical"]');
        if (linkTag) {
            linkTag.setAttribute('href', url);
        }
        this.metaService.updateTag({ name: 'canonical', content: url });
    }

}