  import sql from 'mssql';
  import Database from 'better-sqlite3';
  import { drizzle } from 'drizzle-orm/better-sqlite3';
  import * as schema from "@shared/schema";

  // SQL Server configuration
  const sqlServerConfig = {
    user: 'priyaJ',
    password: '1234',
    server: 'MadhupriyajWS',
    database: 'userInsightsDB',
    port: 1433,
    options: {
      trustServerCertificate: true,
      enableArithAbort: true,
      instanceName: 'SQLEXPRESS'
    }
  };

  // Use SQLite as local database but with SQL Server connection capability
  const sqlite = new Database('database.sqlite');
  export const db = drizzle(sqlite, { schema });

  let sqlServerPool: sql.ConnectionPool;

  export const initializeDatabase = async () => {
    try {
      // Initialize local SQLite database
      console.log('Local SQLite database initialized');
      
      // Also try to connect to SQL Server for future use
      try {
        sqlServerPool = new sql.ConnectionPool(sqlServerConfig);
        await sqlServerPool.connect();
        console.log('SQL Server connection established');
      } catch (sqlError) {
        console.warn('SQL Server connection failed, using local SQLite:', sqlError);
      }
      
      return sqlite;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  };

  export const getSqlServerConnection = () => sqlServerPool;