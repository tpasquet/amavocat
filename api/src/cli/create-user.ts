/**
 * Creates a backoffice account, or resets its password with --reset.
 * Usage: npm run user:create -- --email aurelie@example.com --name "Aurélie Manier" [--role admin] [--reset]
 * The password is read from the prompt (or from the BACKOFFICE_PASSWORD variable for scripts).
 */
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { loadConfig } from '../config.js';
import { openDatabase } from '../db/client.js';
import { userRoles, type UserRole } from '../db/schema.js';
import { createUser, findUserByEmail, setPassword } from '../auth/users.js';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
    role: { type: 'string', default: 'editor' },
    reset: { type: 'boolean', default: false },
  },
});

if (!values.email || (!values.reset && !values.name)) {
  console.error('Usage: user:create -- --email <email> --name <display name> [--role admin|editor] [--reset]');
  process.exit(1);
}
if (!userRoles.includes(values.role as UserRole)) {
  console.error(`Unknown role "${values.role}" (expected: ${userRoles.join(', ')})`);
  process.exit(1);
}

async function readPassword(): Promise<string> {
  if (process.env.BACKOFFICE_PASSWORD) {
    return process.env.BACKOFFICE_PASSWORD;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const password = await rl.question('Password: ');
  rl.close();
  return password;
}

const { db, close } = openDatabase(loadConfig().databasePath);
try {
  const password = await readPassword();
  const existing = findUserByEmail(db, values.email);
  if (values.reset) {
    if (!existing) {
      throw new Error(`No account for ${values.email}`);
    }
    await setPassword(db, existing.id, password);
    console.log(`Password reset for ${existing.email}`);
  } else {
    if (existing) {
      throw new Error(`An account already exists for ${values.email} (use --reset to change its password)`);
    }
    const user = await createUser(db, {
      email: values.email,
      displayName: values.name!,
      password,
      role: values.role as UserRole,
    });
    console.log(`Created ${user.role} account for ${user.email}`);
  }
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
} finally {
  close();
}
