import client from 'prom-client';

// Créer un registre
const register = new client.Registry();

// Ajouter les métriques par défaut
client.collectDefaultMetrics({
  register,
  prefix: 'nextjs_',
});

// Métriques personnalisées
export const httpRequestDuration = new client.Histogram({
  name: 'nextjs_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new client.Counter({
  name: 'nextjs_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const activeUsers = new client.Gauge({
  name: 'nextjs_active_users',
  help: 'Number of active users',
  registers: [register],
});

export const authenticationAttempts = new client.Counter({
  name: 'nextjs_auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['status', 'provider'],
  registers: [register],
});

export const databaseQueries = new client.Histogram({
  name: 'nextjs_database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register],
});

export { register }; 