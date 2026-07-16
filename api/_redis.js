import Redis from 'ioredis';

let client;

/**
 * Returns a cached ioredis client connected via KV_REDIS_URL.
 * This is the connection string Vercel injects when you connect
 * an Upstash Redis database (Storage -> Marketplace -> Upstash -> Redis)
 * with the "KV" environment variable prefix.
 */
export function getRedis() {
  if (!process.env.KV_REDIS_URL) {
    throw new Error(
      'KV_REDIS_URL is not configured. Connect an Upstash Redis database to this project in Vercel (Storage tab) and redeploy.'
    );
  }
  if (!client) {
    client = new Redis(process.env.KV_REDIS_URL, {
      maxRetriesPerRequest: 3,
    });
  }
  return client;
}
