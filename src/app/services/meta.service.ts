import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Constants } from '../global/constant';
import { SupportedLanguages } from '../global/enum';
import { PageMeta } from '../global/interfaces';
import { environment } from '../environments/environment';
import { isSupportedLanguage } from '../utils/language';

const OG_LOCALES: Record<SupportedLanguages, string> = {
    [SupportedLanguages.FR]: 'fr_FR',
    [SupportedLanguages.EN]: 'en_GB',
};

@Injectable({
    providedIn: 'root'
})
export class MetaService {

    constructor(private title: Title, private metaService: Meta, @Inject(DOCUMENT) private document: Document) {
        // Set noindex for dev environment
        if (environment.dev) {
            this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
        }
    }

    setPageMeta(data: PageMeta): void {
        this.title.setTitle(data.title);
        this.metaService.updateTag({ name: 'description', content: data.description });
        this.metaService.updateTag({ property: 'og:title', content: data.ogTitle });
        this.metaService.updateTag({ property: 'og:description', content: data.ogDescription });
        this.metaService.updateTag({ property: 'og:url', content: data.canonical });
        this.metaService.updateTag({ name: 'twitter:title', content: data.ogTitle });
        this.metaService.updateTag({ name: 'twitter:description', content: data.ogDescription });
        this.metaService.updateTag({ name: 'twitter:url', content: data.canonical });

        // Update og:image if provided
        if (data.ogImage) {
            this.metaService.updateTag({ property: 'og:image', content: data.ogImage });
            this.metaService.updateTag({ name: 'twitter:image', content: data.ogImage });
        }

        this.setCanonicalUrl(data.canonical);
        this.setAlternateUrls(data.canonical);
    }

    setCanonicalUrl(url: string) {
        this.upsertLink('link[rel="canonical"]', { rel: 'canonical', href: url });
    }

    /**
     * Canonicals are `${HOSTNAME}/${lang}/${path}`: derives the hreflang links and og:locale of the
     * current page from it, so each page points to its own translation instead of the home page.
     */
    private setAlternateUrls(canonical: string) {
        const [lang, ...path] = new URL(canonical).pathname.split('/').filter(seg => seg);
        if (!isSupportedLanguage(lang)) {
            return;
        }
        const urlFor = (l: SupportedLanguages) => [Constants.HOSTNAME, l, ...path].join('/');

        for (const l of Constants.SUPPORTED_LANGUAGES) {
            this.upsertLink(`link[rel="alternate"][hreflang="${l}"]`, { rel: 'alternate', hreflang: l, href: urlFor(l) });
        }
        this.upsertLink('link[rel="alternate"][hreflang="x-default"]', { rel: 'alternate', hreflang: 'x-default', href: urlFor(Constants.DEFAULT_LANG) });
        this.metaService.updateTag({ property: 'og:locale', content: OG_LOCALES[lang] });
    }

    private upsertLink(selector: string, attributes: Record<string, string>) {
        let link = this.document.head.querySelector<HTMLLinkElement>(selector);
        if (!link) {
            link = this.document.createElement('link');
            this.document.head.appendChild(link);
        }
        for (const [name, value] of Object.entries(attributes)) {
            link.setAttribute(name, value);
        }
    }

}
