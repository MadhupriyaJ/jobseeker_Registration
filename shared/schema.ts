import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const jobseekers = pgTable("jobseekers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  contactNumber: text("contact_number").notNull(),
  email: text("email").notNull(),
  gender: text("gender").notNull(),
  age: integer("age").notNull(),
  skill: text("skill").notNull(),
  experience: text("experience").notNull(),
  location: text("location").notNull(),
  resumeFileName: text("resume_file_name").notNull(),
  resumeFilePath: text("resume_file_path").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobseekerSchema = createInsertSchema(jobseekers).omit({
  id: true,
  createdAt: true,
}).extend({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 characters"),
  email: z.string().email("Invalid email format"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
  age: z.number().min(18, "Age must be at least 18").max(65, "Age must be at most 65"),
  skill: z.string().min(1, "Skill/Trade is required"),
  experience: z.string().min(1, "Years of experience is required"),
  location: z.string().min(2, "Preferred job location is required"),
  resumeFileName: z.string().optional(),
  resumeFilePath: z.string().optional(),
  status: z.string().default("active"),
});

export type InsertJobseeker = z.infer<typeof insertJobseekerSchema>;
export type Jobseeker = typeof jobseekers.$inferSelect;

// Keep existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
