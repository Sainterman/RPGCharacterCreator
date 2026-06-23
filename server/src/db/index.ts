import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? true : false,
});

async function shutdownPool(): Promise<void> {
  try {
    await pool.end();
  } catch (error) {
    // Log and swallow errors during shutdown to avoid masking the original signal
    // eslint-disable-next-line no-console
    console.error('Error while closing database pool:', error);
  }
}

function setupGracefulShutdown(): void {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      await shutdownPool();
      process.exit(0);
    });
  });
}

setupGracefulShutdown();

export default pool;
export { shutdownPool };
