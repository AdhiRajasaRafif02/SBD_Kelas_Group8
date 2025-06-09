# CourseEight Deployment Guide

## Quick Start Deployment

This guide will help you deploy the CourseEight e-learning platform using Docker in just a few simple steps.

### Prerequisites

- Docker installed on your system
- Docker Compose installed
- At least 4GB of available RAM
- Ports 5000, 5173, and 27017 available

### One-Command Deployment

1. **Download the deployment file:**

   ```bash
   curl -O https://raw.githubusercontent.com/AdhiRajasaRafif02/SBD_Kelas_Group8/master/courseight/docker-compose.deploy.yml
   ```

2. **Start the application:**

   ```bash
   docker-compose -f docker-compose.deploy.yml up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

### Demo User Accounts

The system comes pre-loaded with demo data including:

**Student Account:**

- Email: `student@courseight.com`
- Password: `student123`

**Instructor Account:**

- Email: `instructor@courseight.com`
- Password: `instructor123`

**Admin Account:**

- Email: `admin@courseight.com`
- Password: `admin123`

### Available Demo Content

- **5 Courses** with complete content and materials
- **Multiple Assessments** per course with questions and answers
- **Discussion Forums** for each course
- **User Progress Tracking**
- **Student/Instructor/Admin role management**

### Stopping the Application

```bash
docker-compose -f docker-compose.deploy.yml down
```

### Updating to Latest Version

```bash
docker-compose -f docker-compose.deploy.yml pull
docker-compose -f docker-compose.deploy.yml up -d
```

### Troubleshooting

#### Port Conflicts

If you encounter port conflicts:

- **Port 27017 (MongoDB):** Stop any existing MongoDB instances
- **Port 5000 (Backend):** Stop any applications using port 5000
- **Port 5173 (Frontend):** Stop any Vite dev servers

#### Session Issues

The application uses session-based authentication. If you experience login issues:

1. Clear your browser cookies for localhost
2. Restart the backend container: `docker-compose -f docker-compose.deploy.yml restart backend`
3. Check backend logs: `docker logs courseight-backend-1`

#### Database Issues

If data is not loading properly:

1. Check if seeder ran successfully: `docker logs courseight-seeder-1`
2. Restart the entire stack: `docker-compose -f docker-compose.deploy.yml down && docker-compose -f docker-compose.deploy.yml up -d`

#### Checking Container Status

```bash
docker-compose -f docker-compose.deploy.yml ps
```

#### Viewing Logs

```bash
# All services
docker-compose -f docker-compose.deploy.yml logs

# Specific service
docker logs courseight-backend-1
docker logs courseight-frontend-1
docker logs courseight-mongodb-1
```

### Architecture

The application consists of:

- **MongoDB**: Database for storing all application data
- **Backend**: Node.js/Express API server with session management
- **Frontend**: React/Vite application with modern UI
- **Seeder**: One-time service to populate demo data

### Data Persistence

- MongoDB data is persisted in a Docker volume
- User sessions are stored in MongoDB for persistence across restarts
- Course content, user progress, and assessments are permanently stored

### Security Features

- Session-based authentication with secure cookies
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation

### Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all containers are running: `docker-compose -f docker-compose.deploy.yml ps`
3. Check application logs for error messages
4. Ensure all required ports are available

---

**Note**: This deployment is configured for development/demo purposes. For production deployment, additional security configurations may be required.
