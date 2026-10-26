import { SupportedLanguages } from 'src/app/global/enum';
import { Article } from 'src/app/global/interfaces';
import { ArticleService } from './article.service';

const article = (locale: SupportedLanguages, slug: string, translations: Article['translations'] = {}): Article => ({
  id: `${locale}-${slug}`,
  locale,
  slug,
  publishedAt: '2026-10-20T08:00:00.000Z',
  updatedAt: '2026-10-20T08:00:00.000Z',
  title: slug,
  subtitle: '',
  description: '',
  body: '<p>Body</p>',
  tags: [],
  image: null,
  translations,
});

describe('ArticleService', () => {
  let service: ArticleService;

  beforeEach(() => {
    service = new ArticleService();
    // The real data comes from generated/articles.json, empty in tests
    (service as unknown as { articles: Article[] }).articles = [
      article(SupportedLanguages.FR, 'licenciement', { en: 'dismissal' }),
      article(SupportedLanguages.EN, 'dismissal', { fr: 'licenciement' }),
      article(SupportedLanguages.FR, 'accident-du-travail'),
    ];
  });

  it('lists the articles of one language', () => {
    expect(service.list(SupportedLanguages.FR).map(a => a.slug)).toEqual(['licenciement', 'accident-du-travail']);
    expect(service.list(SupportedLanguages.EN).map(a => a.slug)).toEqual(['dismissal']);
  });

  it('finds an article by language and slug', () => {
    expect(service.find(SupportedLanguages.EN, 'dismissal')?.id).toBe('en-dismissal');
    expect(service.find(SupportedLanguages.EN, 'licenciement')).toBeUndefined();
  });

  it('follows a slug from the other language to its translation', () => {
    expect(service.findTranslation(SupportedLanguages.EN, 'licenciement')?.slug).toBe('dismissal');
    expect(service.findTranslation(SupportedLanguages.EN, 'accident-du-travail')).toBeUndefined();
  });
});
