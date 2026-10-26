import { image, longText, richText, tags, text } from '../fields.js';
import { defineContentType } from '../registry.js';

export const article = defineContentType({
  name: 'article',
  label: { singular: 'Article', plural: 'Articles' },
  localized: true,
  schedulable: true,
  slugFrom: 'title',
  titleField: 'title',
  fields: {
    title: text({ label: 'Titre', required: true, max: 120 }),
    subtitle: text({ label: 'Sous-titre', max: 200 }),
    description: longText({
      label: 'Résumé',
      max: 300,
      help: 'Affiché dans la liste des articles et dans les résultats de recherche (150 à 160 caractères idéalement).',
    }),
    body: richText({ label: 'Contenu', required: true }),
    tags: tags({ label: 'Étiquettes', max: 10 }),
    featuredImage: image({ label: 'Image à la une' }),
  },
});
