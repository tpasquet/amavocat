import { z } from 'zod';
import type { Field, FieldDescriptor } from './fields.js';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export interface ContentTypeOptions<F extends Record<string, Field>> {
  /** Identifier used in URLs and in the database, e.g. "article" */
  name: string;
  label: { singular: string; plural: string };
  /** One entry per locale, linked by a translation group */
  localized: boolean;
  /** Entries carry a publication date; without one they stay drafts */
  schedulable: boolean;
  /** Field used to suggest the slug when none is given */
  slugFrom?: keyof F & string;
  /** Field shown in admin lists */
  titleField: keyof F & string;
  fields: F;
}

export interface ContentType<F extends Record<string, Field> = Record<string, Field>>
  extends ContentTypeOptions<F> {
  dataSchema: z.ZodObject<{ [K in keyof F]: F[K]['schema'] }>;
}

export function defineContentType<F extends Record<string, Field>>(
  options: ContentTypeOptions<F>,
): ContentType<F> {
  const shape = Object.fromEntries(
    Object.entries(options.fields).map(([key, field]) => [key, field.schema]),
  ) as { [K in keyof F]: F[K]['schema'] };
  return { ...options, dataSchema: z.object(shape) };
}

/** JSON description of a content type, served to the admin app to build its forms */
export function describeContentType(type: ContentType) {
  return {
    name: type.name,
    label: type.label,
    localized: type.localized,
    schedulable: type.schedulable,
    slugFrom: type.slugFrom ?? null,
    titleField: type.titleField,
    fields: Object.entries(type.fields).map(([key, field]): FieldDescriptor & { key: string } => ({
      key,
      ...field.descriptor,
    })),
  };
}

export class ContentTypeRegistry {
  private readonly types = new Map<string, ContentType>();

  constructor(types: ContentType[]) {
    for (const type of types) {
      if (this.types.has(type.name)) {
        throw new Error(`Content type "${type.name}" is defined twice`);
      }
      this.types.set(type.name, type);
    }
  }

  get(name: string): ContentType | undefined {
    return this.types.get(name);
  }

  all(): ContentType[] {
    return [...this.types.values()];
  }
}
