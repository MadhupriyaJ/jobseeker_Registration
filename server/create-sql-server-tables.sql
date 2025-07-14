-- Create tables for SQL Server (userInsightsDB)
-- Run this script in your SQL Server Management Studio or similar tool

-- Create users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL
    );
END

-- Create jobseekers table
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
END

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_jobseekers_skill')
BEGIN
    CREATE INDEX idx_jobseekers_skill ON jobseekers(skill);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_jobseekers_experience')
BEGIN
    CREATE INDEX idx_jobseekers_experience ON jobseekers(experience);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_jobseekers_location')
BEGIN
    CREATE INDEX idx_jobseekers_location ON jobseekers(location);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_jobseekers_created_at')
BEGIN
    CREATE INDEX idx_jobseekers_created_at ON jobseekers(created_at);
END

PRINT 'Tables created successfully in userInsightsDB database';