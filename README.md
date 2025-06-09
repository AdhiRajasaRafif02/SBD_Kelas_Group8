# Group Member

1. Muhammad Sesarafli Aljagra 2206828071
2. Adhi Rajasa Rafif 2306266943
3. Gerrardin Nabil Zulhian 2306250661
4. Dimas Ananda Sutiardi 2306250586

# CourseEight

CourseEight is a comprehensive e-learning platform designed to facilitate online education through interactive courses, assessments, and discussions. The platform serves three main user roles: Students, Instructors, and Administrators.

Instructors can create and manage courses, upload learning materials, create assessments, and engage with students through discussion forums. Students can enroll in courses, access learning materials, participate in discussions, and take assessments to track their progress. Administrators oversee the platform's operations, manage user accounts, and ensure smooth functionality.

The platform features a modern, responsive interface built with React and styled with Tailwind CSS, providing an optimal learning experience across all devices. The backend is powered by Node.js and Express, with MongoDB handling data storage, ensuring scalability and performance.

# 💻 Tech Stack:

![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

# 🏗️ System Architecture

## Entity Relationship Diagram (ERD)

![ERD](https://i.imgur.com/bp7wLAI.jpeg)

## UML Class Diagram

![UML](https://i.imgur.com/75qRmLX.jpeg)

## Application Flowchart

![Flowchart](https://i.imgur.com/4e0gUs9.jpeg)

## Database Schema

Our application uses MongoDB with the following main collections:

- **Users** (Students, Instructors, Admins)
- **Courses** (Course content and metadata)
- **Assessments** (Quizzes and tests)
- **Progress** (User learning progress)
- **Discussions** (Forum discussions and replies)

## Key Features

1. **User Management**

   - Role-based authentication (Student, Instructor, Admin)
   - JWT-based session management
   - User profiles and progress tracking

2. **Course Management**

   - Course creation and editing
   - Material organization
   - Progress tracking
   - Enrollment management

3. **Assessment System**

   - Multiple assessment types
   - Automated grading
   - Progress tracking
   - Results analysis

4. **Discussion Forums**
   - Course-specific discussions
   - Real-time updates
   - Threaded conversations
   - Announcement system

# 🚀 Quick Start with Docker

## Prerequisites

- Docker Desktop installed and running
- Internet connection

## One Command Setup

```bash
# Download and run CourseEight
curl -O https://raw.githubusercontent.com/AdhiRajasaRafif02/SBD_Kelas_Group8/main/courseight/docker-compose.deploy.yml && docker-compose -f docker-compose.deploy.yml up -d
```

## Manual Setup

```bash
# 1. Download deployment file
curl -O https://raw.githubusercontent.com/AdhiRajasaRafif02/SBD_Kelas_Group8/main/courseight/docker-compose.deploy.yml

# 2. Start the application
docker-compose -f docker-compose.deploy.yml up -d

# 3. Check seeder progress (wait for demo data)
docker-compose -f docker-compose.deploy.yml logs seeder

# 4. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api
```

## 🔑 Demo Accounts

After the seeder completes, you can log in with these accounts:

### Admin Account

- **Email:** admin@courseight.com
- **Password:** admin123
- **Features:** Full platform management, user oversight

### Instructor Account

- **Email:** instructor@courseight.com
- **Password:** instructor123
- **Features:** Create courses, manage assessments, student engagement

### Student Account

- **Email:** student@courseight.com
- **Password:** student123
- **Features:** Enroll in courses, take assessments, join discussions

## 📚 Demo Content

The application automatically loads with:

- 5 sample courses (JavaScript, React, MongoDB, Full Stack)
- Interactive quizzes and assessments
- Discussion forums with sample conversations
- Multiple user accounts for testing different roles

## 🛑 Stopping the Application

```bash
docker-compose -f docker-compose.deploy.yml down
```

## 🔄 Reset Everything (Fresh Start)

```bash
# Remove all data and containers
docker-compose -f docker-compose.deploy.yml down -v

# Start fresh
docker-compose -f docker-compose.deploy.yml up -d
```

# 🔒 Security Features

- Session-based authentication with bcrypt password hashing
- Role-based access control (Student, Instructor, Admin)
- CORS configuration and request rate limiting
- Input validation and sanitization
- Secure HTTP headers with Helmet middleware
- Protected routes and API endpoints
- Session management and automatic logout

# 🆘 Troubleshooting

## Application won't start

```bash
# Check if Docker is running
docker --version

# View application logs
docker-compose -f docker-compose.deploy.yml logs

# Restart all services
docker-compose -f docker-compose.deploy.yml restart
```

## Database issues

```bash
# Reset database and start fresh
docker-compose -f docker-compose.deploy.yml down -v
docker-compose -f docker-compose.deploy.yml up -d
```

## Port conflicts

Make sure ports 5173 (frontend) and 5000 (backend) are not being used by other applications.

## Can't access the application

- Wait 1-2 minutes for all services to fully start
- Check container status: `docker-compose -f docker-compose.deploy.yml ps`
- Ensure Docker Desktop is running properly

# 🛠️ Development Setup

For developers who want to contribute or modify the code:

## Clone Repository

```bash
git clone https://github.com/AdhiRajasaRafif02/SBD_Kelas_Group8.git
cd courseight
```

## Development with Docker

```bash
# Start development environment
docker-compose up --build

# Run seeder manually (if needed)
docker exec courseight-backend-1 npm run seed
```

## Manual Development (Alternative)

```bash
# Backend setup
cd backend
npm install
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

# 🤝 Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**🎓 Happy Learning with CourseEight!**

For support or questions, please check the troubleshooting section above or create an issue in the repository.
