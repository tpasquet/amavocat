import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

/**
 * Field builders used by content type definitions. Each field knows how to validate its value (zod)
 * and how to describe itself to the admin app, which renders a form from these descriptors.
 */
export interface FieldDescriptor {
  kind: 'text' | 'longText' | 'richText' | 'tags' | 'image' | 'boolean';
  label: string;
  required: boolean;
  help?: string;
  max?: number;
}

export interface Field<T = unknown> {
  descriptor: FieldDescriptor;
  schema: z.ZodType<T | undefined>;
}

interface BaseOptions {
  label: string;
  required?: boolean;
  help?: string;
}

function field<T>(
  kind: FieldDescriptor['kind'],
  opts: BaseOptions & { max?: number },
  schema: z.ZodType<T>,
): Field<T> {
  const descriptor: FieldDescriptor = {
    kind,
    label: opts.label,
    required: opts.required ?? false,
    ...(opts.help ? { help: opts.help } : {}),
    ...(opts.max ? { max: opts.max } : {}),
  };
  return { descriptor, schema: opts.required ? schema : schema.optional() };
}

function boundedString(opts: { required?: boolean; max?: number }) {
  let schema = z.string().trim();
  if (opts.required) schema = schema.min(1);
  if (opts.max) schema = schema.max(opts.max);
  return schema;
}

export const text = (opts: BaseOptions & { max?: number }) =>
  field('text', opts, boundedString({ ...opts, max: opts.max ?? 300 }));

export const longText = (opts: BaseOptions & { max?: number }) =>
  field('longText', opts, boundedString({ ...opts, max: opts.max ?? 5000 }));

// Tags and attributes the rich text editor can produce; anything else is stripped on save
const richTextPolicy: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote',
    'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'hr', 'code', 'pre',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
  },
  allowedSchemes: ['https', 'http', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https', 'http'] },
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, richTextPolicy);
}

export const richText = (opts: BaseOptions) =>
  field(
    'richText',
    opts,
    z
      .string()
      .max(200_000)
      .transform(sanitizeRichText)
      .refine((html) => !opts.required || html.replace(/<[^>]*>/g, '').trim().length > 0, {
        message: 'Required',
      }),
  );

export const tags = (opts: BaseOptions & { max?: number }) =>
  field(
    'tags',
    opts,
    z
      .array(z.string().trim().min(1).max(50))
      .max(opts.max ?? 20)
      .transform((values) => [...new Set(values)]),
  );

export const imageValue = z.object({
  url: z.url({ protocol: /^https?$/ }).max(500),
  alt: z.string().trim().max(300).default(''),
});
export type ImageValue = z.infer<typeof imageValue>;

export const image = (opts: BaseOptions) => field('image', opts, imageValue);

export const boolean = (opts: BaseOptions) => field('boolean', opts, z.boolean());
