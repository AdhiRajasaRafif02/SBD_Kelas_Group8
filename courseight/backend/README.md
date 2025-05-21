# Courseight - Online Class Management System

## Overview
Courseight is an online class management system inspired by platforms like Coursera. It provides features for course management, user progress tracking, automated assessments, and discussion forums.

## Features
- **Course Management**: Create, retrieve, update, and delete courses.
- **User Progress Tracking**: Monitor and manage user progress in courses.
- **Automated Assessments**: Handle assessments with automatic grading.
- **Discussion Forums**: Facilitate discussions related to courses.

## Advanced Queries
- Calculate average scores per student.
- Rank students based on their performance.
- Generate statistics on user progress.
- Count active participants per class.

## Technologies Used
- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: ODM for MongoDB to manage data models.
- **dotenv**: Module to load environment variables from a `.env` file.

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd courseight
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and configure your MongoDB connection string.

4. Start the server:
   ```
   node server.js
   ```

## Directory Structure
```
courseight
├── src
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## Contribution
Feel free to contribute to the project by submitting issues or pull requests. Your feedback and contributions are welcome!