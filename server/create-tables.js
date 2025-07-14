import sql from 'mssql';

const config = {
  user: 'priyaJ',
  password: '1234',
  server: 'MadhupriyajWS',
  database: 'userInsightsDB',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: 'SQLEXPRESS'
  },
  port: 1433
};

async function createTables() {
  try {
    console.log('Connecting to SQL Server...');
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Connected successfully!');

    // Create users table
    console.log('Creating users table...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      BEGIN
          CREATE TABLE users (
              id INT IDENTITY(1,1) PRIMARY KEY,
              username NVARCHAR(255) NOT NULL UNIQUE,
              password NVARCHAR(255) NOT NULL
          );
          PRINT 'Users table created successfully';
      END
      ELSE
      BEGIN
          PRINT 'Users table already exists';
      END
    `);

    // Create jobseekers table
    console.log('Creating jobseekers table...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='jobseekers' AND xtype='U')
      BEGIN
          CREATE TABLE jobseekers (
              id INT IDENTITY(1,1) PRIMARY KEY,
              full_name NVARCHAR(255) NOT NULL,
              contact_number NVARCHAR(50) NOT NULL,
              email NVARCHAR(255) NOT NULL,
              gender NVARCHAR(50) NOT NULL,
              age INT NOT NULL,
              skill NVARCHAR(255) NOT NULL,
              experience NVARCHAR(255) NOT NULL,
              location NVARCHAR(255) NOT NULL,
              resume_file_name NVARCHAR(255) NOT NULL,
              resume_file_path NVARCHAR(500) NOT NULL,
              status NVARCHAR(50) DEFAULT 'active' NOT NULL,
              created_at DATETIME DEFAULT GETDATE() NOT NULL
          );
          PRINT 'Jobseekers table created successfully';
      END
      ELSE
      BEGIN
          PRINT 'Jobseekers table already exists';
      END
    `);

    // Create indexes
    console.log('Creating indexes...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_jobseekers_skill')
      BEGIN
          CREATE INDEX idx_jobseekers_skill ON jobseekers(skill);
          PRINT 'Index on skill created';
      END
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_jobseekers_experience')
      BEGIN
          CREATE INDEX idx_jobseekers_experience ON jobseekers(experience);
          PRINT 'Index on experience created';
      END
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_jobseekers_location')
      BEGIN
          CREATE INDEX idx_jobseekers_location ON jobseekers(location);
          PRINT 'Index on location created';
      END
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_jobseekers_created_at')
      BEGIN
          CREATE INDEX idx_jobseekers_created_at ON jobseekers(created_at);
          PRINT 'Index on created_at created';
      END
    `);

    console.log('All tables and indexes created successfully!');
    
    // Test the connection by querying the tables
    console.log('Testing table creation...');
    const usersResult = await pool.request().query('SELECT COUNT(*) as count FROM users');
    const jobseekersResult = await pool.request().query('SELECT COUNT(*) as count FROM jobseekers');
    
    console.log(`Users table has ${usersResult.recordset[0].count} records`);
    console.log(`Jobseekers table has ${jobseekersResult.recordset[0].count} records`);
    
    await pool.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createTables();