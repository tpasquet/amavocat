import { SupportedLanguages } from "./enum";

export interface PageMeta {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage?: string;
    canonical: string;
    /**
     * URL of this page in each language, when the path differs between languages (articles).
     * By default the hreflang links swap the language segment of the canonical URL.
     */
    alternates?: Partial<Record<SupportedLanguages, string>>;
}

/** A published article, as written to generated/articles.json by scripts/fetch-content.mts */
export interface Article {
    id: string;
    locale: SupportedLanguages;
    slug: string;
    publishedAt: string;
    updatedAt: string;
    title: string;
    subtitle: string;
    description: string;
    /** HTML, sanitized by the API when it was saved */
    body: string;
    tags: string[];
    image: { url: string; alt: string } | null;
    /** Slug of this article in the other languages */
    translations: Partial<Record<SupportedLanguages, string>>;
}
