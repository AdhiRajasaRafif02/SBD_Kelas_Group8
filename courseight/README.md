# CourseEight

**Group Members:**
1. Muhammad Sesarafli Aljagra 2206828071
2. Adhi Rajasa Rafif 2306266943
3. Gerrardin Nabil Zulhian 2306250661
4. Dimas Ananda Sutiardi 2306250586

---

CourseEight is a comprehensive e-learning platform designed to facilitate online education through interactive courses, assessments, and discussions. The platform serves three main user roles: Students, Instructors, and Administrators.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed and running
- Internet connection

### Option 1: One Command Setup
```bash
curl -O https://raw.githubusercontent.com/sesarafli/courseight/main/docker-compose.deploy.yml && docker-compose -f docker-compose.deploy.yml up -d
```

### Option 2: Manual Setup

#### 1. Download deployment file
```bash
curl -O https://raw.githubusercontent.com/sesarafli/courseight/main/docker-compose.deploy.yml
```
#### 2. Start the application
```bash
docker-compose -f docker-compose.deploy.yml up -d
```
#### 3. Check seeder progress (optional)
```bash
docker-compose -f docker-compose.deploy.yml logs seeder
```
#### 4. Access the application
#### Frontend: http://localhost:5173
#### Backend API: http://localhost:5000/api

## Demo Accounts
After running the seeder, you can log in with these accounts:

### Admin Account
- Email: admin@courseight.com
- Password: admin123
- Features: Full platform management
### Instructor Accounts
- Email: instructor@courseight.com
- Password: instructor123
- Features: Create courses, manage assessments, engage with students
- Email: wilson@courseight.com
- Password: instructor123

### Student Accounts
- Email: student@courseight.com
- Password: student123
- Features: Enroll in courses, take assessments, participate in - discussions

### Additional student accounts:

- jane@courseight.com / student123
- bob@courseight.com / student123
- alice@courseight.com / student123

## Demo Content
The seeder creates the following sample content:

### Courses
- Introduction to CourseEight (Beginner)
   - Platform tutorial and getting started guide
   - Duration: 2 hours
- JavaScript Fundamentals (Beginner)
   - Complete JavaScript basics course
   - Duration: 8 hours
- React for Beginners (Intermediate)
   - Modern React development course
   - Duration: 12 hours

- Database Design with MongoDB (Intermediate)
   - NoSQL database design principles
   - Duration: 10 hours

- Full Stack Development (Advanced)
   - Complete MERN stack course
   - Duration: 20 hours

### Assessments
- Welcome Quiz for platform orientation
- JavaScript Basics Test
- React Components Quiz
- Interactive assessments for each course

### Discussion Forums
- Welcome announcements
- Technical Q&A threads
- Best practices discussions
- Student-instructor interactions

## Development Setup
Using Docker (Recommended)