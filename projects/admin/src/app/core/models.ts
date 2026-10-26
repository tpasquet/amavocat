// Shapes returned by the API (api/src/content). Keep in sync when the API changes.

export type Locale = 'fr' | 'en';
export type EntryStatus = 'draft' | 'scheduled' | 'published';
export type FieldKind = 'text' | 'longText' | 'richText' | 'tags' | 'image' | 'boolean';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor';
}

export interface FieldDescriptor {
  key: string;
  kind: FieldKind;
  label: string;
  required: boolean;
  help?: string;
  max?: number;
}

export interface ContentTypeDescriptor {
  name: string;
  label: { singular: string; plural: string };
  localized: boolean;
  schedulable: boolean;
  slugFrom: string | null;
  titleField: string;
  fields: FieldDescriptor[];
}

export interface ImageValue {
  url: string;
  alt: string;
}

export interface Entry {
  id: string;
  type: string;
  locale: Locale | null;
  translationGroup: string;
  slug: string;
  status: EntryStatus;
  publishAt: string | null;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EntryTranslation {
  id: string;
  locale: Locale | null;
  slug: string;
}

export interface EntryWrite {
  locale?: Locale | null;
  slug?: string;
  publishAt: string | null;
  data: Record<string, unknown>;
  translationOf?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}
