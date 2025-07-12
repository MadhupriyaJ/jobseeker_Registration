# TalentHub - Jobseeker Registration System

## Overview

TalentHub is a full-stack web application for managing jobseeker profiles. It allows users to register jobseekers with personal information, skills, and resume uploads, as well as browse and search through existing profiles. The application features a modern React frontend with a Node.js/Express backend and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **File Uploads**: Multer for handling PDF resume uploads
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utility functions and configurations
│   │   └── hooks/        # Custom React hooks
├── server/           # Express backend
│   ├── index.ts      # Main server file
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database layer abstraction
│   └── vite.ts       # Vite development server integration
├── shared/           # Shared code between frontend and backend
│   └── schema.ts     # Database schema and validation
└── migrations/       # Database migration files
```

## Key Components

### Database Schema
- **jobseekers**: Main entity storing personal information, skills, experience, and resume details
- **users**: User authentication (minimal implementation)
- Validation using Zod schemas with Drizzle integration

### API Endpoints
- `GET /api/jobseekers` - Retrieve all jobseekers with optional filtering
- `POST /api/jobseekers` - Create new jobseeker profile with file upload
- `GET /api/jobseekers/:id/resume` - Download resume files
- Search functionality with filters for skills, experience, and location

### Frontend Pages
- **Registration Page**: Form for creating new jobseeker profiles
- **Dashboard Page**: Browse, search, and view jobseeker profiles
- **Profile Detail Modal**: Detailed view of individual jobseeker information

### UI Components
- Comprehensive shadcn/ui component library
- Custom file upload component with drag-and-drop support
- Responsive design with mobile-first approach
- Toast notifications for user feedback

## Data Flow

1. **Registration Flow**:
   - User fills out registration form with validation
   - Form data and resume file are uploaded via multipart form
   - Server validates data and stores in database
   - File is saved to local uploads directory
   - Success feedback provided to user

2. **Browse/Search Flow**:
   - Dashboard loads all jobseekers via React Query
   - Client-side filtering for real-time search experience
   - Modal displays detailed profile information
   - Resume download functionality

3. **Storage Layer**:
   - Abstract storage interface with in-memory implementation
   - Easy to swap for database implementation
   - Type-safe operations using Drizzle ORM schemas

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, Radix UI, shadcn/ui components
- **Styling**: Tailwind CSS, class-variance-authority
- **Data Fetching**: TanStack Query
- **Form Handling**: React Hook Form, Hookform Resolvers
- **Validation**: Zod
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Backend Dependencies
- **Server**: Express.js
- **Database**: Drizzle ORM, @neondatabase/serverless
- **File Upload**: Multer
- **Session**: connect-pg-simple
- **Validation**: Zod integration with Drizzle

### Development Tools
- **Build**: Vite, esbuild
- **TypeScript**: Full type safety across the stack
- **Development**: Hot reloading, error overlays
- **Replit Integration**: Cartographer plugin, runtime error modal

## Deployment Strategy

### Development
- Vite development server with hot module replacement
- Express server with middleware for logging and error handling
- File uploads stored in local `uploads/` directory
- Environment variables for database connection

### Production
- Frontend built with Vite and served statically
- Backend bundled with esbuild for Node.js execution
- Database migrations handled by Drizzle Kit
- File storage requires persistent volume or cloud storage solution

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- File upload directory configuration
- Session secret and database credentials

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and a focus on developer experience and user interface quality.