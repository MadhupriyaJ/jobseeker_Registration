# TalentHub - Jobseeker Registration System

A modern full-stack web application for managing jobseeker profiles with React frontend and Express backend, featuring form submission, profile listings, and resume management.

## Features

- **Jobseeker Registration**: Complete profile creation with personal information, skills, and resume uploads
- **Profile Management**: Browse, search, and filter jobseeker profiles
- **Resume Upload**: PDF file upload with secure storage
- **Advanced Search**: Filter by skills, experience level, location, and general search
- **Responsive Design**: Mobile-first approach with modern UI components
- **Database Integration**: Hybrid setup supporting both SQL Server and SQLite

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **Radix UI** and **shadcn/ui** for components
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** for type-safe database operations
- **SQL Server** (primary) with SQLite fallback
- **Multer** for file uploads
- **Zod** for data validation

### Database
- **Microsoft SQL Server** (primary)
- **SQLite** (fallback/development)
- Automatic fallback mechanism

## Getting Started

### Prerequisites
- Node.js 20 or higher
- SQL Server (optional - SQLite fallback available)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Database Configuration

### SQL Server Setup (Optional)
If you want to use SQL Server instead of SQLite:

1. **Configure SQL Server for remote connections**:
   - Enable TCP/IP in SQL Server Configuration Manager
   - Set TCP port to 1433
   - Enable SQL Server authentication mode

2. **Configure Windows Firewall**:
   - Allow inbound connections on port 1433
   - Or temporarily disable firewall for testing

3. **Update connection settings** in `server/db.ts` and `server/sql-server-storage.ts`

4. **Create database tables**:
   ```bash
   node server/create-tables.js
   ```

Detailed setup instructions are available in `SQL_SERVER_SETUP_GUIDE.md`.

### SQLite (Default)
The application automatically uses SQLite when SQL Server is unavailable. No additional configuration required.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utility functions
│   │   └── hooks/        # Custom React hooks
├── server/                # Express backend
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database abstraction layer
│   ├── db.ts             # Database configuration
│   └── sql-server-storage.ts # SQL Server implementation
├── shared/                # Shared types and schemas
│   └── schema.ts         # Database schema and validation
└── uploads/              # File upload storage
```

## API Endpoints

### Jobseekers
- `GET /api/jobseekers` - Retrieve all jobseekers with optional filtering
- `POST /api/jobseekers` - Create new jobseeker profile with file upload
- `GET /api/jobseekers/:id/resume` - Download resume files

### Query Parameters (GET /api/jobseekers)
- `search` - Search in names and emails
- `skill` - Filter by specific skill
- `experience` - Filter by experience level
- `location` - Filter by location

## Database Schema

### Users Table
- `id` - Primary key (auto-increment)
- `username` - Unique username
- `password` - Password hash

### Jobseekers Table
- `id` - Primary key (auto-increment)
- `full_name` - Full name
- `contact_number` - Phone number
- `email` - Email address
- `gender` - Gender
- `age` - Age
- `skill` - Primary skill
- `experience` - Experience level
- `location` - Location
- `resume_file_name` - Original filename
- `resume_file_path` - File storage path
- `status` - Status (active/inactive)
- `created_at` - Creation timestamp

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes

## File Upload

Resume files are stored in the `uploads/` directory. Supported formats:
- PDF files only
- Maximum file size: 10MB
- Files are renamed with unique identifiers to prevent conflicts

## Search and Filtering

The application supports:
- **Text search** in names and emails
- **Skill filtering** from predefined skill options
- **Experience level filtering** (Entry, Mid, Senior, etc.)
- **Location filtering** with partial matches
- **Combined filters** for refined searches

## Environment Variables

- `NODE_ENV` - Environment mode (development/production)
- `SQL_SERVER_*` - SQL Server connection credentials (optional)
- `PORT` - Server port (default: 5000)

## Development

### Database Schema Changes
1. Update `shared/schema.ts`
2. Update storage implementations in `server/storage.ts`
3. Run `npm run db:push` to apply changes

### Adding New Features
1. Update database schema if needed
2. Add API routes in `server/routes.ts`
3. Create/update React components
4. Add proper TypeScript types

## Deployment

The application is configured for deployment on Replit:
- Frontend is built with Vite
- Backend runs on Express
- Static files are served from the build directory
- Database automatically initializes on startup

## Security Considerations

- File uploads are restricted to PDF format
- SQL injection prevention through parameterized queries
- Input validation using Zod schemas
- CORS configuration for production deployment

## Troubleshooting

### Common Issues

1. **Database connection failed**: Check SQL Server configuration or use SQLite fallback
2. **File upload errors**: Verify `uploads/` directory exists and has write permissions
3. **Build errors**: Check TypeScript types and dependencies

### Logs
- Application logs are displayed in the console
- Database connection status is logged on startup
- File upload operations are logged

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the `SQL_SERVER_SETUP_GUIDE.md` for database setup
3. Check console logs for error details