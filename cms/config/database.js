// Neon Postgres. Use the pooled connection string from Neon > Connect (it ends in ?sslmode=require).
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      connectionString: env('DATABASE_URL'),
      ssl: env.bool('DATABASE_SSL', true) ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false) } : false,
      schema: env('DATABASE_SCHEMA', 'public'),
    },
    // Neon closes idle connections, so keep no idle pool.
    pool: { min: 0, max: env.int('DATABASE_POOL_MAX', 5) },
    acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
  },
});
