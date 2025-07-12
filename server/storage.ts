import { users, jobseekers, type User, type InsertUser, type Jobseeker, type InsertJobseeker } from "@shared/schema";

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

export const storage = new MemStorage();
