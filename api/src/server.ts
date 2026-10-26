import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db/client.js';
import { deleteExpiredSessions } from './auth/sessions.js';
import { githubDispatchTrigger, RebuildScheduler } from './publishing/rebuild.js';

const config = loadConfig();
const { db, close } = openDatabase(config.databasePath);

let rebuilds: RebuildScheduler | undefined;
const app = await buildApp({
  config,
  db,
  onEntriesChanged: (event) => {
    if (event.affectsPublicSite) {
      rebuilds?.request(`${event.type} ${event.id} ${event.action}`);
    }
  },
});

if (config.githubDispatchToken) {
  rebuilds = new RebuildScheduler(
    db,
    githubDispatchTrigger({ token: config.githubDispatchToken, repository: config.githubRepository }),
    app.log,
  );
  rebuilds.start();
} else {
  app.log.warn('GITHUB_DISPATCH_TOKEN is not set: the public site will not be rebuilt automatically');
}

deleteExpiredSessions(db);
const cleanup = setInterval(() => deleteExpiredSessions(db), 60 * 60 * 1000);
cleanup.unref();

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    rebuilds?.stop();
    await app.close();
    close();
    process.exit(0);
  });
}

await app.listen({ host: config.host, port: config.port });
