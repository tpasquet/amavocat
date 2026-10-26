import { mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import type { Config } from '../config.js';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

// Detect the format from the file's first bytes rather than trusting the browser's MIME type
const signatures: { ext: string; test: (b: Buffer) => boolean }[] = [
  { ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'webp', test: (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP' },
  { ext: 'gif', test: (b) => b.toString('latin1', 0, 6) === 'GIF87a' || b.toString('latin1', 0, 6) === 'GIF89a' },
];

export function detectImageExtension(buffer: Buffer): string | undefined {
  return signatures.find((signature) => signature.test(buffer))?.ext;
}

export async function mediaRoutes(app: FastifyInstance, opts: { config: Config }) {
  const mediaDir = resolve(opts.config.mediaDir);
  mkdirSync(mediaDir, { recursive: true });

  await app.register(multipart, { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } });
  await app.register(fastifyStatic, {
    root: mediaDir,
    prefix: '/media/',
    index: false,
    list: false,
    // File names are random and never reused
    maxAge: '365d',
    immutable: true,
  });

  app.post('/api/admin/media', { preHandler: app.requireUser }, async (request, reply) => {
    const file = await request.file();
    if (!file) {
      return reply.code(400).send({ error: 'no_file' });
    }
    let buffer: Buffer;
    try {
      buffer = await file.toBuffer();
    } catch {
      return reply.code(413).send({ error: 'file_too_large', maxBytes: MAX_UPLOAD_BYTES });
    }
    const ext = detectImageExtension(buffer);
    if (!ext) {
      return reply.code(415).send({ error: 'unsupported_type', message: 'JPEG, PNG, WebP or GIF only' });
    }
    const name = `${crypto.randomUUID()}.${ext}`;
    await writeFile(resolve(mediaDir, name), buffer, { flag: 'wx' });
    return reply.code(201).send({ url: `${opts.config.publicUrl}/media/${name}`, bytes: buffer.length });
  });
}
