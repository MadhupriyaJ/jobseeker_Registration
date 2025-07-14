import sql from 'mssql';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

// SQL Server configuration
const sqlServerConfig = {
  user: process.env.SQL_SERVER_USER || 'priyaJ',
  password: process.env.SQL_SERVER_PASSWORD || '1234',
  server: process.env.SQL_SERVER_HOST || 'MadhupriyajWS',
  database: process.env.SQL_SERVER_DATABASE || 'userInsightsDB',
  port: parseInt(process.env.SQL_SERVER_PORT || '1433', 10),
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: process.env.SQL_SERVER_INSTANCE || 'SQLEXPRESS'
  }
};

// Use SQLite as local database but with SQL Server connection capability
const sqlite = new Database('database.sqlite');
export const db = drizzle(sqlite, { schema });

let sqlServerPool: sql.ConnectionPool;

export const initializeDatabase = async () => {
  try {
    // Initialize local SQLite database and create tables if they don't exist
    console.log('Local SQLite database initialized');
    
    // Create tables manually since drizzle config is for PostgreSQL
    const createJobseekersTable = `
      CREATE TABLE IF NOT EXISTS jobseekers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        email TEXT NOT NULL,
        gender TEXT NOT NULL,
        age INTEGER NOT NULL,
        skill TEXT NOT NULL,
        experience TEXT NOT NULL,
        location TEXT NOT NULL,
        resume_file_name TEXT NOT NULL,
        resume_file_path TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL
      )
    `;
    
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `;
    
    sqlite.exec(createJobseekersTable);
    sqlite.exec(createUsersTable);
    console.log('SQLite tables created successfully');
    
    // Also try to connect to SQL Server for future use
    try {
      sqlServerPool = new sql.ConnectionPool(sqlServerConfig);
      await sqlServerPool.connect();
      console.log('SQL Server connection established');
    } catch (sqlError) {
      console.warn('SQL Server connection failed, using local SQLite:', sqlError.message);
    }
    
    return sqlite;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export const getSqlServerConnection = () => sqlServerPool;