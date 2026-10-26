import { and, eq, gt, lte } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';
import type { Db } from '../db/client.js';
import { entries, settings } from '../db/schema.js';

const LAST_REQUEST_KEY = 'site.lastRebuildRequestedAt';

export type RebuildTrigger = (reason: string) => Promise<void>;

/**
 * Keeps the static public site in sync with the published content by asking for a rebuild:
 * - shortly after an edit that changes what the site shows (edits within the debounce window share one build)
 * - when a scheduled entry's publication date passes, checked every `intervalMs`
 * The time of the last successful request is stored, so a restart neither loses nor repeats a rebuild.
 */
export class RebuildScheduler {
  private debounceTimer?: NodeJS.Timeout;
  private interval?: NodeJS.Timeout;
  private pendingReasons = new Set<string>();
  private running?: Promise<void>;

  constructor(
    private readonly db: Db,
    private readonly trigger: RebuildTrigger,
    private readonly log: Pick<FastifyBaseLogger, 'info' | 'warn' | 'error'>,
    private readonly options: { debounceMs: number; intervalMs: number; now?: () => Date } = {
      debounceMs: 30_000,
      intervalMs: 5 * 60_000,
    },
  ) {}

  private now(): Date {
    return this.options.now?.() ?? new Date();
  }

  start(): void {
    // On startup, catch up with any publication date that passed while the server was down
    void this.checkDueEntries();
    this.interval = setInterval(() => void this.checkDueEntries(), this.options.intervalMs);
    this.interval.unref();
  }

  stop(): void {
    clearInterval(this.interval);
    clearTimeout(this.debounceTimer);
  }

  /** Asks for a rebuild after the debounce delay */
  request(reason: string): void {
    this.pendingReasons.add(reason);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => void this.flush(), this.options.debounceMs);
    this.debounceTimer.unref();
  }

  lastRequestedAt(): Date | null {
    const row = this.db.select().from(settings).where(eq(settings.key, LAST_REQUEST_KEY)).get();
    return row ? new Date(row.value) : null;
  }

  /** Requests a rebuild if an entry became published since the last request */
  async checkDueEntries(): Promise<void> {
    const now = this.now();
    // First run ever: only entries that became due in the last day, not the whole history
    const since = this.lastRequestedAt() ?? new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const due = this.db
      .select({ id: entries.id })
      .from(entries)
      .where(and(gt(entries.publishAt, since), lte(entries.publishAt, now)))
      .all();
    if (due.length > 0) {
      this.pendingReasons.add(`${due.length} scheduled entr${due.length > 1 ? 'ies' : 'y'} became published`);
      await this.flush();
    }
  }

  /** Sends the pending request now; on failure the reasons stay pending and the next check retries */
  async flush(): Promise<void> {
    if (this.running) {
      await this.running;
    }
    if (this.pendingReasons.size === 0) return;
    clearTimeout(this.debounceTimer);
    const reasons = [...this.pendingReasons];
    this.pendingReasons.clear();
    // The build reads the content after this moment, so everything published before it is included
    const requestedAt = this.now();
    this.running = (async () => {
      try {
        await this.trigger(reasons.join('; '));
        const value = requestedAt.toISOString();
        this.db
          .insert(settings)
          .values({ key: LAST_REQUEST_KEY, value, updatedAt: requestedAt })
          .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: requestedAt } })
          .run();
        this.log.info({ reasons }, 'Site rebuild requested');
      } catch (error) {
        reasons.forEach((reason) => this.pendingReasons.add(reason));
        this.log.error({ err: error, reasons }, 'Site rebuild request failed, will retry');
      }
    })();
    try {
      await this.running;
    } finally {
      this.running = undefined;
    }
  }
}

/** Triggers the public site's deploy workflow through a GitHub repository_dispatch event */
export function githubDispatchTrigger(opts: { token: string; repository: string; eventType?: string }): RebuildTrigger {
  return async (reason) => {
    const response = await fetch(`https://api.github.com/repos/${opts.repository}/dispatches`, {
      method: 'POST',
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${opts.token}`,
        'x-github-api-version': '2022-11-28',
        'content-type': 'application/json',
        'user-agent': 'amavocat-api',
      },
      body: JSON.stringify({ event_type: opts.eventType ?? 'content-changed', client_payload: { reason } }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw new Error(`GitHub answered ${response.status}: ${await response.text()}`);
    }
  };
}
