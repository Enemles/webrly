import { 
  activeUsers, 
  authenticationAttempts, 
  databaseQueries 
} from './metrics';

// Helper pour tracker les utilisateurs actifs
export const trackActiveUsers = (count: number) => {
  try {
    activeUsers.set(count);
  } catch (error) {
    console.error('Erreur lors du tracking des utilisateurs actifs:', error);
  }
};

// Helper pour tracker les tentatives d'authentification
export const trackAuthAttempt = (status: 'success' | 'failure', provider: string = 'clerk') => {
  try {
    authenticationAttempts.labels(status, provider).inc();
  } catch (error) {
    console.error('Erreur lors du tracking des tentatives d\'auth:', error);
  }
};

// Helper pour tracker les requêtes de base de données
export const trackDatabaseQuery = async <T>(
  operation: string, 
  table: string, 
  queryFn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  
  try {
    const result = await queryFn();
    const duration = (Date.now() - start) / 1000;
    
    databaseQueries
      .labels(operation, table)
      .observe(duration);
    
    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    
    databaseQueries
      .labels(`${operation}_error`, table)
      .observe(duration);
    
    throw error;
  }
};

// Type pour les opérations de base de données courantes
export type DatabaseOperation = 
  | 'SELECT' 
  | 'INSERT' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'UPSERT';

// Helper spécialisé pour Prisma
export const trackPrismaQuery = <T>(
  operation: DatabaseOperation,
  model: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  return trackDatabaseQuery(operation.toLowerCase(), model.toLowerCase(), queryFn);
}; 