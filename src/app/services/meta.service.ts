import { DOCUMENT } from '@angular/common';
import { DestroyRef, Inject, Injectable } from '@angular/core';
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
        this.setAlternateUrls(data.canonical, data.alternates);
    }

    setCanonicalUrl(url: string) {
        this.upsertLink('link[rel="canonical"]', { rel: 'canonical', href: url });
    }

    /**
     * Canonicals are `${HOSTNAME}/${lang}/${path}`: derives the hreflang links and og:locale of the
     * current page from it, so each page points to its own translation instead of the home page.
     */
    private setAlternateUrls(canonical: string, alternates?: Partial<Record<SupportedLanguages, string>>) {
        const [lang, ...path] = new URL(canonical).pathname.split('/').filter(seg => seg);
        if (!isSupportedLanguage(lang)) {
            return;
        }
        const urlFor = (l: SupportedLanguages) => alternates ? alternates[l] : [Constants.HOSTNAME, l, ...path].join('/');

        for (const l of Constants.SUPPORTED_LANGUAGES) {
            this.setOrRemoveLink(`link[rel="alternate"][hreflang="${l}"]`, { rel: 'alternate', hreflang: l }, urlFor(l));
        }
        // x-default: the default language when it exists, otherwise the page itself
        this.upsertLink('link[rel="alternate"][hreflang="x-default"]', { rel: 'alternate', hreflang: 'x-default', href: urlFor(Constants.DEFAULT_LANG) ?? canonical });
        this.metaService.updateTag({ property: 'og:locale', content: OG_LOCALES[lang] });
    }

    /**
     * Adds a JSON-LD block to <head> (Angular strips <script> tags from templates) and removes it when
     * the page that added it is destroyed.
     */
    setStructuredData(id: string, data: object, destroyRef: DestroyRef): void {
        this.document.getElementById(id)?.remove();
        const script = this.document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        this.document.head.appendChild(script);
        destroyRef.onDestroy(() => this.document.getElementById(id)?.remove());
    }

    /** An article may not exist in every language: its missing translations get no hreflang link */
    private setOrRemoveLink(selector: string, attributes: Record<string, string>, href: string | undefined) {
        if (href) {
            this.upsertLink(selector, { ...attributes, href });
        } else {
            this.document.head.querySelector(selector)?.remove();
        }
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
