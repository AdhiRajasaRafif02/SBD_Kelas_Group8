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

## Database Schema
Our application uses MongoDB with the following main collections:
- Users (Students, Instructors, Admins)
- Courses
- Assessments
- Progress
- Discussions

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

# 🚀 Installation Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Docker (optional)

## Using Docker
1. Clone the repository
```bash
git clone https://github.com/AdhiRajasaRafif02/SBD_Kelas_Group8.git
```

2. Start the application using Docker Compose
```bash
cd courseight
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Manual Installation

### Frontend
1. Navigate to the frontend directory
```bash
cd courseight/frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

### Backend
1. Navigate to the backend directory
```bash
cd courseight/backend
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file in the backend directory with the following variables:
```env
DATABASE_URL=mongodb://localhost:27017/courseight
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

4. Start the server
```bash
npm run start
```

# 📝 Environment Variables

## Backend (.env)
```env
DATABASE_URL=mongodb://localhost:27017/courseight
SESSION_SECRET=your_session_secret
NODE_ENV=development
PORT=3000
```

## Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

# 👥 Project Structure

```
courseight/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── Components/    # Reusable UI components
│   │   ├── Pages/        # Page components
│   │   ├── Services/     # API services
│   │   └── Contexts/     # React contexts
│   └── public/           # Static assets
└── backend/              # Express backend application
    ├── src/
    │   ├── controllers/  # Route controllers
    │   ├── models/       # Database models
    │   ├── routes/       # API routes
    │   ├── middleware/   # Custom middleware
    │   └── utils/        # Utility functions
    └── config/           # Configuration files
```

# 🔒 Security Features

- JWT-based authentication
- Session management
- Rate limiting
- CORS configuration
- Request validation
- Error handling middleware
- Secure password hashing
- Protected routes

# 🤝 Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a Pull Request