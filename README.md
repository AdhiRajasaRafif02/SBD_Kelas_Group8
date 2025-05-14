# Online Class Management System Backend

This is the backend for an online class management system, built with Express.js and MongoDB. It includes features like course listing, learning progress tracking, automatic grading, and discussion forums.

## Features

### Main Features
- **Course Listing**: View all available courses.
- **Learning Progress**: Track user progress in courses.
- **Automatic Grading**: Manage and view grades for users.
- **Discussion Forums**: Participate in course-specific discussions.

### Advanced Queries
- **Average Grade per Student**: Calculate the average grade for each student in a course.
- **Progress Statistics**: View statistics like total participants and completion rates for a course.

## API Endpoints

### Courses
- `GET /courses`: Get all courses.

### Progress
- `GET /progress/:userId`: Get progress for a specific user.
- `GET /progress/statistics/:courseId`: Get progress statistics for a course.

### Grades
- `GET /grades/:courseId`: Get grades for a course.
- `GET /grades/average/:courseId`: Get average grade per student in a course.

### Forum
- `GET /forum/:courseId`: Get forum posts for a course.

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following content:
   ```env
   MONGO_URI=<your-mongodb-connection-string>
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Testing

Use tools like Postman or cURL to test the API endpoints.

## License

This project is licensed under the MIT License.
