import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db/client.js';
import { deleteExpiredSessions } from './auth/sessions.js';

const config = loadConfig();
const { db, close } = openDatabase(config.databasePath);
const app = await buildApp({ config, db });

deleteExpiredSessions(db);
const cleanup = setInterval(() => deleteExpiredSessions(db), 60 * 60 * 1000);
cleanup.unref();

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    await app.close();
    close();
    process.exit(0);
  });
}

await app.listen({ host: config.host, port: config.port });
