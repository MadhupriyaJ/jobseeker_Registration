import { users, jobseekers, type User, type InsertUser, type Jobseeker, type InsertJobseeker } from "@shared/schema";
import { db, getSqlServerConnection } from "./db";
import { eq, like, and, or } from "drizzle-orm";
import { SqlServerStorage } from "./sql-server-storage";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Jobseeker methods
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobseekers: Map<number, Jobseeker>;
  private currentUserId: number;
  private currentJobseekerId: number;

  constructor() {
    this.users = new Map();
    this.jobseekers = new Map();
    this.currentUserId = 1;
    this.currentJobseekerId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createJobseeker(insertJobseeker: InsertJobseeker): Promise<Jobseeker> {
    const id = this.currentJobseekerId++;
    const jobseeker: Jobseeker = {
      ...insertJobseeker,
      id,
      createdAt: new Date(),
      status: insertJobseeker.status || "active",
      resumeFileName: insertJobseeker.resumeFileName || "",
      resumeFilePath: insertJobseeker.resumeFilePath || "",
    };
    this.jobseekers.set(id, jobseeker);
    return jobseeker;
  }

  async getAllJobseekers(): Promise<Jobseeker[]> {
    return Array.from(this.jobseekers.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getJobseekerById(id: number): Promise<Jobseeker | undefined> {
    return this.jobseekers.get(id);
  }

  async searchJobseekers(filters: {
    search?: string;
    skill?: string;
    experience?: string;
    location?: string;
  }): Promise<Jobseeker[]> {
    let results = Array.from(this.jobseekers.values());

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(jobseeker => 
        jobseeker.fullName.toLowerCase().includes(searchTerm) ||
        jobseeker.email.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.skill) {
      results = results.filter(jobseeker => jobseeker.skill === filters.skill);
    }

    if (filters.experience) {
      results = results.filter(jobseeker => jobseeker.experience === filters.experience);
    }

    if (filters.location) {
      results = results.filter(jobseeker => 
        jobseeker.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    return results.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateJobseeker(id: number, updates: Partial<Jobseeker>): Promise<Jobseeker | undefined> {
    const jobseeker = this.jobseekers.get(id);
    if (!jobseeker) return undefined;

    const updatedJobseeker = { ...jobseeker, ...updates };
    this.jobseekers.set(id, updatedJobseeker);
    return updatedJobseeker;
  }

  async deleteJobseeker(id: number): Promise<boolean> {
    return this.jobseekers.delete(id);
  }
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

// Try to use SQL Server storage if available, otherwise fall back to SQLite
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

// Initialize storage
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
