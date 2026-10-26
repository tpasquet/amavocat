import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openDatabase, type Db } from '../src/db/client.js';
import { entries } from '../src/db/schema.js';
import { RebuildScheduler } from '../src/publishing/rebuild.js';

const silent = { info: () => {}, warn: () => {}, error: () => {} };
const minute = 60_000;

describe('RebuildScheduler', () => {
  let db: Db;
  let close: () => void;
  let now: Date;
  let trigger: ReturnType<typeof vi.fn<(reason: string) => Promise<void>>>;
  let scheduler: RebuildScheduler;

  const addEntry = (publishAt: Date | null) =>
    db
      .insert(entries)
      .values({
        id: crypto.randomUUID(),
        type: 'article',
        locale: 'fr',
        translationGroup: crypto.randomUUID(),
        slug: crypto.randomUUID(),
        publishAt,
        data: {},
        createdAt: now,
        updatedAt: now,
      })
      .run();

  beforeEach(() => {
    vi.useFakeTimers();
    ({ db, close } = openDatabase(':memory:'));
    now = new Date('2026-11-02T08:00:00Z');
    trigger = vi.fn(async () => {});
    scheduler = new RebuildScheduler(db, trigger, silent, { debounceMs: 30_000, intervalMs: 5 * minute, now: () => now });
  });

  afterEach(() => {
    scheduler.stop();
    close();
    vi.useRealTimers();
  });

  it('groups edits made within the debounce window into one rebuild', async () => {
    scheduler.request('a');
    scheduler.request('b');
    expect(trigger).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(trigger).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveBeenCalledWith('a; b');
    expect(scheduler.lastRequestedAt()).toEqual(now);
  });

  it('rebuilds once when a scheduled entry becomes published, then not again', async () => {
    await scheduler.flush();
    scheduler.request('initial');
    await scheduler.flush();
    trigger.mockClear();

    addEntry(new Date(now.getTime() + 10 * minute));
    addEntry(null);
    await scheduler.checkDueEntries();
    expect(trigger).not.toHaveBeenCalled();

    now = new Date(now.getTime() + 11 * minute);
    await scheduler.checkDueEntries();
    expect(trigger).toHaveBeenCalledTimes(1);

    now = new Date(now.getTime() + 5 * minute);
    await scheduler.checkDueEntries();
    expect(trigger).toHaveBeenCalledTimes(1);
  });

  it('checks for due entries on a timer', async () => {
    scheduler.request('initial');
    await scheduler.flush();
    trigger.mockClear();
    addEntry(new Date(now.getTime() + 2 * minute));
    scheduler.start();
    now = new Date(now.getTime() + 3 * minute);
    await vi.advanceTimersByTimeAsync(5 * minute);
    expect(trigger).toHaveBeenCalledTimes(1);
  });

  it('keeps the request pending when the trigger fails, and retries', async () => {
    trigger.mockRejectedValueOnce(new Error('GitHub down'));
    scheduler.request('edit');
    await scheduler.flush();
    expect(scheduler.lastRequestedAt()).toBeNull();

    await scheduler.flush();
    expect(trigger).toHaveBeenCalledTimes(2);
    expect(trigger).toHaveBeenLastCalledWith('edit');
    expect(scheduler.lastRequestedAt()).toEqual(now);
  });
});
