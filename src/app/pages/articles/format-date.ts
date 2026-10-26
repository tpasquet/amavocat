import { SupportedLanguages } from 'src/app/global/enum';

/** "2 novembre 2026" / "2 November 2026", identical on the server and in the browser */
export function formatArticleDate(iso: string, lang: SupportedLanguages): string {
  return new Intl.DateTimeFormat(lang === SupportedLanguages.FR ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  }).format(new Date(iso));
}
