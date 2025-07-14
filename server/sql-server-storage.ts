import sql from 'mssql';
import { IStorage } from './storage';
import { User, InsertUser, Jobseeker, InsertJobseeker } from '@shared/schema';

export class SqlServerStorage implements IStorage {
  private pool: sql.ConnectionPool;
  
  constructor() {
    const config = {
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
    
    this.pool = new sql.ConnectionPool(config);
  }

  async connect(): Promise<void> {
    await this.pool.connect();
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM users WHERE id = @id');
    
    return result.recordset[0] || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM users WHERE username = @username');
    
    return result.recordset[0] || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.pool.request()
      .input('username', sql.NVarChar, insertUser.username)
      .input('password', sql.NVarChar, insertUser.password)
      .query(`
        INSERT INTO users (username, password) 
        OUTPUT INSERTED.* 
        VALUES (@username, @password)
      `);
    
    return result.recordset[0];
  }

  async createJobseeker(insertJobseeker: InsertJobseeker): Promise<Jobseeker> {
    const result = await this.pool.request()
      .input('fullName', sql.NVarChar, insertJobseeker.fullName)
      .input('contactNumber', sql.NVarChar, insertJobseeker.contactNumber)
      .input('email', sql.NVarChar, insertJobseeker.email)
      .input('gender', sql.NVarChar, insertJobseeker.gender)
      .input('age', sql.Int, insertJobseeker.age)
      .input('skill', sql.NVarChar, insertJobseeker.skill)
      .input('experience', sql.NVarChar, insertJobseeker.experience)
      .input('location', sql.NVarChar, insertJobseeker.location)
      .input('resumeFileName', sql.NVarChar, insertJobseeker.resumeFileName || '')
      .input('resumeFilePath', sql.NVarChar, insertJobseeker.resumeFilePath || '')
      .input('status', sql.NVarChar, 'active')
      .input('createdAt', sql.DateTime, new Date())
      .query(`
        INSERT INTO jobseekers (
          full_name, contact_number, email, gender, age, skill, 
          experience, location, resume_file_name, resume_file_path, 
          status, created_at
        ) 
        OUTPUT INSERTED.* 
        VALUES (
          @fullName, @contactNumber, @email, @gender, @age, @skill,
          @experience, @location, @resumeFileName, @resumeFilePath,
          @status, @createdAt
        )
      `);
    
    return this.mapJobseekerFromSqlServer(result.recordset[0]);
  }

  async getAllJobseekers(): Promise<Jobseeker[]> {
    const result = await this.pool.request()
      .query('SELECT * FROM jobseekers ORDER BY created_at DESC');
    
    return result.recordset.map(record => this.mapJobseekerFromSqlServer(record));
  }

  async getJobseekerById(id: number): Promise<Jobseeker | undefined> {
    const result = await this.pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM jobseekers WHERE id = @id');
    
    const record = result.recordset[0];
    return record ? this.mapJobseekerFromSqlServer(record) : undefined;
  }

  async searchJobseekers(filters: {
    search?: string;
    skill?: string;
    experience?: string;
    location?: string;
  }): Promise<Jobseeker[]> {
    let query = 'SELECT * FROM jobseekers WHERE 1=1';
    const request = this.pool.request();

    if (filters.search) {
      query += ` AND (full_name LIKE @search OR email LIKE @search)`;
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    if (filters.skill && filters.skill !== 'all') {
      query += ` AND skill = @skill`;
      request.input('skill', sql.NVarChar, filters.skill);
    }

    if (filters.experience && filters.experience !== 'all') {
      query += ` AND experience = @experience`;
      request.input('experience', sql.NVarChar, filters.experience);
    }

    if (filters.location) {
      query += ` AND location LIKE @location`;
      request.input('location', sql.NVarChar, `%${filters.location}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await request.query(query);
    return result.recordset.map(record => this.mapJobseekerFromSqlServer(record));
  }

  async updateJobseeker(id: number, updates: Partial<Jobseeker>): Promise<Jobseeker | undefined> {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) return this.getJobseekerById(id);

    const setClause = fields.map(field => `${this.mapFieldName(field)} = @${field}`).join(', ');
    const request = this.pool.request().input('id', sql.Int, id);

    fields.forEach(field => {
      const value = updates[field as keyof Jobseeker];
      if (field === 'age') {
        request.input(field, sql.Int, value);
      } else {
        request.input(field, sql.NVarChar, value);
      }
    });

    const result = await request.query(`
      UPDATE jobseekers 
      SET ${setClause} 
      OUTPUT INSERTED.* 
      WHERE id = @id
    `);

    const record = result.recordset[0];
    return record ? this.mapJobseekerFromSqlServer(record) : undefined;
  }

  async deleteJobseeker(id: number): Promise<boolean> {
    const result = await this.pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM jobseekers WHERE id = @id');
    
    return result.rowsAffected[0] > 0;
  }

  private mapJobseekerFromSqlServer(record: any): Jobseeker {
    return {
      id: record.id,
      fullName: record.full_name,
      contactNumber: record.contact_number,
      email: record.email,
      gender: record.gender,
      age: record.age,
      skill: record.skill,
      experience: record.experience,
      location: record.location,
      resumeFileName: record.resume_file_name,
      resumeFilePath: record.resume_file_path,
      status: record.status,
      createdAt: record.created_at
    };
  }

  private mapFieldName(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'fullName': 'full_name',
      'contactNumber': 'contact_number',
      'resumeFileName': 'resume_file_name',
      'resumeFilePath': 'resume_file_path',
      'createdAt': 'created_at'
    };
    return fieldMap[field] || field;
  }
}