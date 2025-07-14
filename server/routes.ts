import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobseekerSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all jobseekers with optional filtering
  app.get("/api/jobseekers", async (req, res) => {
    try {
      const { search, skill, experience, location } = req.query;
      
      const jobseekers = await storage.searchJobseekers({
        search: search as string,
        skill: skill as string,
        experience: experience as string,
        location: location as string,
      });

      res.json(jobseekers);
    } catch (error) {
      console.error('Error fetching jobseekers:', error);
      res.status(500).json({ message: "Failed to fetch jobseekers" });
    }
  });

  // Get single jobseeker by ID
  app.get("/api/jobseekers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const jobseeker = await storage.getJobseekerById(id);
      
      if (!jobseeker) {
        return res.status(404).json({ message: "Jobseeker not found" });
      }

      res.json(jobseeker);
    } catch (error) {
      console.error('Error fetching jobseeker:', error);
      res.status(500).json({ message: "Failed to fetch jobseeker" });
    }
  });

  // Create new jobseeker
  app.post("/api/jobseekers", upload.single('resume'), async (req, res) => {
    try {
      const resumeFile = req.file;
      
      if (!resumeFile) {
        return res.status(400).json({ message: "Resume file is required" });
      }

      const jobseekerData = {
        ...req.body,
        age: parseInt(req.body.age),
        resumeFileName: resumeFile.originalname,
        resumeFilePath: resumeFile.path,
      };

      const validatedData = insertJobseekerSchema.parse(jobseekerData);
      const jobseeker = await storage.createJobseeker(validatedData);

      res.status(201).json(jobseeker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create jobseeker" });
    }
  });

  // Download resume
  app.get("/api/jobseekers/:id/resume", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const jobseeker = await storage.getJobseekerById(id);
      
      if (!jobseeker) {
        return res.status(404).json({ message: "Jobseeker not found" });
      }

      if (!jobseeker.resumeFilePath || !fs.existsSync(jobseeker.resumeFilePath)) {
        return res.status(404).json({ message: "Resume file not found" });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${jobseeker.resumeFileName}"`);
      res.sendFile(path.resolve(jobseeker.resumeFilePath));
    } catch (error) {
      res.status(500).json({ message: "Failed to download resume" });
    }
  });

  // Update jobseeker
  app.put("/api/jobseekers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const jobseeker = await storage.updateJobseeker(id, updates);
      
      if (!jobseeker) {
        return res.status(404).json({ message: "Jobseeker not found" });
      }

      res.json(jobseeker);
    } catch (error) {
      res.status(500).json({ message: "Failed to update jobseeker" });
    }
  });

  // Delete jobseeker
  app.delete("/api/jobseekers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteJobseeker(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Jobseeker not found" });
      }

      res.json({ message: "Jobseeker deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete jobseeker" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
