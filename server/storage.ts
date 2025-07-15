// storage.ts
import { users, jobseekers, type User, type InsertUser, type Jobseeker, type InsertJobseeker } from "@shared/schema";
import { db, getSqlServerConnection } from "./db";
import { eq, like, and, or } from "drizzle-orm";
import sql from "mssql";




const config = {
  user: "priyaJ",         // 🔁 MSSQL username
  password: "1234",     // 🔁 MSSQL password
  server: "MadhupriyajWS",           // or your MSSQL IP/hostname
  database: "userInsightsDB",    // 🔁 your database name
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export const pool = new sql.ConnectionPool(config);
export const poolConnect = pool.connect();

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createJobseeker(jobseeker: InsertJobseeker): Promise<Jobseeker>;
  getAllJobseekers(): Promise<Jobseeker[]>;
  getJobseekerById(id: number): Promise<Jobseeker | undefined>;
  searchJobseekers(filters: {
    search?: string;
    skill?: string;
    experience?: string;
    location?: string;
  }): Promise<Jobseeker[]>;
  updateJobseeker(id: number, updates: Partial<Jobseeker>): Promise<Jobseeker | undefined>;
  deleteJobseeker(id: number): Promise<boolean>;
}

export class SqlServerStorage implements IStorage {
  private isInitialized = false;

  async connect() {
    await this.ensureInitialized();
  }

  private async ensureInitialized() {
    if (this.isInitialized) return;

    const pool = getSqlServerConnection();
    if (!pool) throw new Error("SQL Server connection is not available");

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='jobseekers' AND xtype='U')
      CREATE TABLE jobseekers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        full_name NVARCHAR(255) NOT NULL,
        contact_number NVARCHAR(50) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        gender NVARCHAR(20) NOT NULL,
        age INT NOT NULL,
        skill NVARCHAR(100) NOT NULL,
        experience NVARCHAR(100) NOT NULL,
        location NVARCHAR(255) NOT NULL,
        resume_file_name NVARCHAR(255) NOT NULL,
        resume_file_path NVARCHAR(500) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'active',
        created_at NVARCHAR(50) NOT NULL
      );
    `);

    this.isInitialized = true;
  }

  async createJobseeker(data: InsertJobseeker): Promise<Jobseeker> {
    await this.ensureInitialized();
    const pool = getSqlServerConnection();
    const result = await pool.request()
      .input("full_name", sql.NVarChar, data.fullName)
      .input("contact_number", sql.NVarChar, data.contactNumber)
      .input("email", sql.NVarChar, data.email)
      .input("gender", sql.NVarChar, data.gender)
      .input("age", sql.Int, data.age)
      .input("skill", sql.NVarChar, data.skill)
      .input("experience", sql.NVarChar, data.experience)
      .input("location", sql.NVarChar, data.location)
      .input("resume_file_name", sql.NVarChar, data.resumeFileName || "")
      .input("resume_file_path", sql.NVarChar, data.resumeFilePath || "")
      .input("status", sql.NVarChar, data.status || "active")
      .input("created_at", sql.NVarChar, data.createdAt || new Date().toISOString())
      .query(`
        INSERT INTO jobseekers (
          full_name, contact_number, email, gender, age, skill, experience,
          location, resume_file_name, resume_file_path, status, created_at
        )
        OUTPUT INSERTED.*
        VALUES (@full_name, @contact_number, @email, @gender, @age, @skill,
                @experience, @location, @resume_file_name, @resume_file_path,
                @status, @created_at)
      `);

    return {
      id: result.recordset[0].id,
      ...data,
    };
  }

  // The rest of the IStorage methods can return mock/empty or be implemented as needed.
  async getUser(): Promise<User | undefined> { return undefined; }
  async getUserByUsername(): Promise<User | undefined> { return undefined; }
  async createUser(): Promise<User> { return { id: 0, username: '', password: '' }; }
  async getAllJobseekers(): Promise<Jobseeker[]> { return []; }
  // async getJobseekerById(): Promise<Jobseeker | undefined> { return undefined; }
  async getJobseekerById(id: number): Promise<Jobseeker | undefined> {
  await this.ensureInitialized();
  const pool = getSqlServerConnection();

  const result = await pool.request()
    .input("id", sql.Int, id)
    .query("SELECT * FROM jobseekers WHERE id = @id");

  if (result.recordset.length === 0) return undefined;

  const row = result.recordset[0];
  return {
    id: row.id,
    fullName: row.full_name,
    contactNumber: row.contact_number,
    email: row.email,
    gender: row.gender,
    age: row.age,
    skill: row.skill,
    experience: row.experience,
    location: row.location,
    resumeFileName: row.resume_file_name,
    resumeFilePath: row.resume_file_path,
    status: row.status,
    createdAt: row.created_at,
  };
}

  async searchJobseekers(): Promise<Jobseeker[]> { return []; }
  async updateJobseeker(): Promise<Jobseeker | undefined> { return undefined; }
  async deleteJobseeker(): Promise<boolean> { return false; }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createJobseeker(insertJobseeker: InsertJobseeker): Promise<Jobseeker> {
    const jobseekerData = {
      ...insertJobseeker,
      createdAt: new Date().toISOString(),
      resumeFileName: insertJobseeker.resumeFileName || "",
      resumeFilePath: insertJobseeker.resumeFilePath || "",
    };

    const [jobseeker] = await db
      .insert(jobseekers)
      .values(jobseekerData)
      .returning();
    return jobseeker;
  }

  async getAllJobseekers(): Promise<Jobseeker[]> {
    return await db.select().from(jobseekers).orderBy(jobseekers.createdAt);
  }

  async getJobseekerById(id: number): Promise<Jobseeker | undefined> {
    const [jobseeker] = await db.select().from(jobseekers).where(eq(jobseekers.id, id));
    return jobseeker || undefined;
  }

  
  async searchJobseekers(filters: {
    search?: string;
    skill?: string;
    experience?: string;
    location?: string;
  }): Promise<Jobseeker[]> {
    let query = db.select().from(jobseekers);
    const conditions = [];

    if (filters.search) {
      conditions.push(
        or(
          like(jobseekers.fullName, `%${filters.search}%`),
          like(jobseekers.email, `%${filters.search}%`)
        )
      );
    }

    if (filters.skill && filters.skill !== "all") {
      conditions.push(eq(jobseekers.skill, filters.skill));
    }

    if (filters.experience && filters.experience !== "all") {
      conditions.push(eq(jobseekers.experience, filters.experience));
    }

    if (filters.location && filters.location !== "all") {
      conditions.push(like(jobseekers.location, `%${filters.location}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(jobseekers.createdAt);
  }

  async updateJobseeker(id: number, updates: Partial<Jobseeker>): Promise<Jobseeker | undefined> {
    const [jobseeker] = await db
      .update(jobseekers)
      .set(updates)
      .where(eq(jobseekers.id, id))
      .returning();
    return jobseeker || undefined;
  }

  async deleteJobseeker(id: number): Promise<boolean> {
    const result = await db.delete(jobseekers).where(eq(jobseekers.id, id));
    return result.changes > 0;
  }
}

const createStorage = async (): Promise<IStorage> => {
  try {
    const sqlServerStorage = new SqlServerStorage();
    await sqlServerStorage.connect();
    console.log('Using SQL Server storage');
    return sqlServerStorage;
  } catch (error) {
    console.log('SQL Server unavailable, using SQLite storage');
    return new DatabaseStorage();
  }
};

let storageInstance: IStorage;
export const initStorage = async (): Promise<void> => {
  storageInstance = await createStorage();
};

export const storage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!storageInstance) {
      throw new Error('Storage not initialized. Call initStorage() first.');
    }
    const value = storageInstance[prop as keyof IStorage];
    if (typeof value === 'function') {
      return value.bind(storageInstance);
    }
    return value;
  }
});
