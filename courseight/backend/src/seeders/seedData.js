const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Course = require("../models/Course");
const Assessment = require("../models/Assessment");
const Discussion = require("../models/Discussion");

const seedUsers = async () => {
  try {
    console.log("🌱 Seeding users...");

    // Check if users already exist
    const existingUser = await User.findOne({ email: "admin@courseight.com" });
    if (existingUser) {
      console.log("✅ Users already exist, skipping user seeding...");
      return await User.find();
    }

    // Create users
    const users = [];

    // Admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await User.create({
      username: "admin",
      email: "admin@courseight.com",
      password: adminPassword,
      role: "admin",
    });
    users.push(admin);

    // Instructor users
    const instructorPassword = await bcrypt.hash("instructor123", 12);
    const instructor1 = await User.create({
      username: "dr_smith",
      email: "instructor@courseight.com",
      password: instructorPassword,
      role: "instructor",
    });

    const instructor2 = await User.create({
      username: "prof_wilson",
      email: "wilson@courseight.com",
      password: instructorPassword,
      role: "instructor",
    });
    users.push(instructor1, instructor2);

    // Student users
    const studentPassword = await bcrypt.hash("student123", 12);
    const students = await User.insertMany([
      {
        username: "john_doe",
        email: "student@courseight.com",
        password: studentPassword,
        role: "student",
      },
      {
        username: "jane_smith",
        email: "jane@courseight.com",
        password: studentPassword,
        role: "student",
      },
      {
        username: "bob_johnson",
        email: "bob@courseight.com",
        password: studentPassword,
        role: "student",
      },
      {
        username: "alice_brown",
        email: "alice@courseight.com",
        password: studentPassword,
        role: "student",
      },
    ]);
    users.push(...students);

    console.log("✅ Users seeded successfully");
    return users;
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
};

const seedCourses = async (users) => {
  try {
    console.log("🌱 Seeding courses...");

    // Check if courses already exist
    const existingCourse = await Course.findOne({
      title: "Introduction to CourseEight",
    });
    if (existingCourse) {
      console.log("✅ Courses already exist, skipping course seeding...");
      return await Course.find();
    }

    const instructors = users.filter((user) => user.role === "instructor");

    const courses = await Course.insertMany([
      {
        title: "Introduction to CourseEight",
        description:
          "Welcome to CourseEight! This comprehensive course will introduce you to all the features and capabilities of our learning platform. Perfect for new users.",
        instructor: instructors[0]._id,
        difficulty: "Beginner",
        categories: ["Demo", "Tutorial", "Platform"],
        duration: "2 hours",
        content:
          "This course covers platform navigation, user interface, course enrollment, assessment taking, and discussion participation.",
        isPublished: true,
        modules: [
          {
            title: "Getting Started",
            content: "Learn the basics of navigating CourseEight platform.",
            order: 1,
          },
          {
            title: "Course Features",
            content: "Explore all the amazing features available to you.",
            order: 2,
          },
        ],
      },
      {
        title: "JavaScript Fundamentals",
        description:
          "Master the fundamentals of JavaScript programming. From variables and functions to objects and arrays, this course covers everything you need to start coding in JavaScript.",
        instructor: instructors[0]._id,
        difficulty: "Beginner",
        categories: ["Programming", "Web Development", "JavaScript"],
        duration: "8 hours",
        content:
          "Learn variables, functions, objects, arrays, DOM manipulation, and modern ES6+ features.",
        isPublished: true,
        modules: [
          {
            title: "Variables and Data Types",
            content:
              "Understanding JavaScript variables, primitives, and data types.",
            order: 1,
          },
          {
            title: "Functions and Scope",
            content:
              "Deep dive into function declarations, expressions, and scope.",
            order: 2,
          },
          {
            title: "Objects and Arrays",
            content: "Working with complex data structures in JavaScript.",
            order: 3,
          },
        ],
      },
      {
        title: "React for Beginners",
        description:
          "Learn React from scratch! Build modern web applications with components, state management, and hooks. Perfect for developers new to React.",
        instructor: instructors[1]._id,
        difficulty: "Intermediate",
        categories: ["React", "Web Development", "Frontend"],
        duration: "12 hours",
        content:
          "Components, JSX, state, props, hooks, event handling, and building real projects.",
        isPublished: true,
        modules: [
          {
            title: "React Basics",
            content: "Introduction to React, JSX, and component structure.",
            order: 1,
          },
          {
            title: "State and Props",
            content: "Managing component state and passing data with props.",
            order: 2,
          },
          {
            title: "Hooks and Effects",
            content: "Modern React with useState, useEffect, and custom hooks.",
            order: 3,
          },
        ],
      },
      {
        title: "Database Design with MongoDB",
        description:
          "Learn NoSQL database design principles with MongoDB. Understand document structure, collections, indexing, and query optimization.",
        instructor: instructors[1]._id,
        difficulty: "Intermediate",
        categories: ["Database", "MongoDB", "Backend"],
        duration: "10 hours",
        content:
          "Document modeling, collections, indexing, aggregation pipeline, and performance optimization.",
        isPublished: true,
        modules: [
          {
            title: "MongoDB Basics",
            content: "Introduction to NoSQL and MongoDB fundamentals.",
            order: 1,
          },
          {
            title: "Document Modeling",
            content: "Best practices for designing MongoDB schemas.",
            order: 2,
          },
          {
            title: "Queries and Aggregation",
            content: "Advanced querying and data aggregation techniques.",
            order: 3,
          },
        ],
      },
      {
        title: "Full Stack Development",
        description:
          "Build complete web applications from frontend to backend. This advanced course combines React, Node.js, Express, and MongoDB.",
        instructor: instructors[0]._id,
        difficulty: "Advanced",
        categories: ["Full Stack", "MERN", "Web Development"],
        duration: "20 hours",
        content:
          "Complete MERN stack development, authentication, deployment, and best practices.",
        isPublished: true,
        modules: [
          {
            title: "Backend with Node.js",
            content: "Building RESTful APIs with Node.js and Express.",
            order: 1,
          },
          {
            title: "Frontend Integration",
            content: "Connecting React frontend with backend APIs.",
            order: 2,
          },
          {
            title: "Authentication & Security",
            content: "Implementing secure authentication and authorization.",
            order: 3,
          },
          {
            title: "Deployment",
            content: "Deploying full stack applications to production.",
            order: 4,
          },
        ],
      },
    ]);

    console.log("✅ Courses seeded successfully");
    return courses;
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
    throw error;
  }
};

const seedAssessments = async (courses, users) => {
  try {
    console.log("🌱 Seeding assessments...");

    // Check if assessments already exist
    const existingAssessment = await Assessment.findOne({
      title: "Welcome Quiz",
    });
    if (existingAssessment) {
      console.log(
        "✅ Assessments already exist, skipping assessment seeding..."
      );
      return await Assessment.find();
    }

    const instructors = users.filter((user) => user.role === "instructor");

    const assessments = await Assessment.insertMany([
      {
        title: "Welcome Quiz",
        description:
          "A simple quiz to test your understanding of the CourseEight platform",
        courseId: courses[0]._id,
        instructor: instructors[0]._id,
        questions: [
          {
            question: "What is CourseEight?",
            type: "multiple-choice",
            options: [
              "A learning platform",
              "A game",
              "A social media",
              "A calculator",
            ],
            correctAnswer: 0,
            points: 10,
          },
          {
            question: "Which roles are available on CourseEight?",
            type: "multiple-choice",
            options: [
              "Only Students",
              "Students and Teachers",
              "Students, Instructors, and Admins",
              "Only Admins",
            ],
            correctAnswer: 2,
            points: 10,
          },
          {
            question: "CourseEight supports discussion forums.",
            type: "true-false",
            options: ["True", "False"],
            correctAnswer: 0,
            points: 5,
          },
        ],
        timeLimit: 15,
        isPublished: true,
        totalPoints: 25,
      },
      {
        title: "JavaScript Basics Test",
        description: "Test your knowledge of JavaScript fundamentals",
        courseId: courses[1]._id,
        instructor: instructors[0]._id,
        questions: [
          {
            question: "Which of the following is NOT a JavaScript data type?",
            type: "multiple-choice",
            options: ["String", "Boolean", "Float", "Undefined"],
            correctAnswer: 2,
            points: 10,
          },
          {
            question: 'What does "const" keyword do in JavaScript?',
            type: "multiple-choice",
            options: [
              "Creates a variable that can be reassigned",
              "Creates a constant variable",
              "Creates a function",
              "Creates an object",
            ],
            correctAnswer: 1,
            points: 10,
          },
          {
            question: "JavaScript is a statically typed language.",
            type: "true-false",
            options: ["True", "False"],
            correctAnswer: 1,
            points: 5,
          },
          {
            question: "What is the output of: console.log(typeof null)?",
            type: "multiple-choice",
            options: ['"null"', '"object"', '"undefined"', '"number"'],
            correctAnswer: 1,
            points: 15,
          },
        ],
        timeLimit: 30,
        isPublished: true,
        totalPoints: 40,
      },
      {
        title: "React Components Quiz",
        description: "Test your understanding of React components and JSX",
        courseId: courses[2]._id,
        instructor: instructors[1]._id,
        questions: [
          {
            question: "What is JSX?",
            type: "multiple-choice",
            options: [
              "JavaScript XML",
              "Java Syntax Extension",
              "JSON Extended",
              "JavaScript Express",
            ],
            correctAnswer: 0,
            points: 10,
          },
          {
            question: "Which hook is used for managing component state?",
            type: "multiple-choice",
            options: ["useEffect", "useState", "useContext", "useReducer"],
            correctAnswer: 1,
            points: 10,
          },
          {
            question: "React components must return a single parent element.",
            type: "true-false",
            options: ["True", "False"],
            correctAnswer: 0,
            points: 5,
          },
        ],
        timeLimit: 20,
        isPublished: true,
        totalPoints: 25,
      },
    ]);

    console.log("✅ Assessments seeded successfully");
    return assessments;
  } catch (error) {
    console.error("❌ Error seeding assessments:", error);
    throw error;
  }
};

const seedDiscussions = async (courses, users) => {
  try {
    console.log("🌱 Seeding discussions...");

    // Check if discussions already exist
    const existingDiscussion = await Discussion.findOne({
      title: "Welcome to CourseEight!",
    });
    if (existingDiscussion) {
      console.log(
        "✅ Discussions already exist, skipping discussion seeding..."
      );
      return await Discussion.find();
    }

    const students = users.filter((user) => user.role === "student");
    const instructors = users.filter((user) => user.role === "instructor");

    const discussions = await Discussion.insertMany([
      {
        courseId: courses[0]._id,
        userId: instructors[0]._id,
        title: "Welcome to CourseEight!",
        content:
          "Welcome everyone! This is our official discussion forum. Feel free to ask questions, share insights, and help each other learn. Looking forward to our journey together!",
        tags: ["welcome", "announcement", "general"],
        isAnnouncement: true,
        replies: [
          {
            userId: students[0]._id,
            content:
              "Thank you for the warm welcome! Excited to be here and learn.",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
          {
            userId: students[1]._id,
            content:
              "This platform looks amazing! Can't wait to explore all the features.",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          },
        ],
        likes: [students[0]._id, students[1]._id, students[2]._id],
      },
      {
        courseId: courses[1]._id,
        userId: students[0]._id,
        title: "Question about JavaScript closures",
        content:
          "I'm having trouble understanding closures in JavaScript. Can someone explain with a simple example? I understand the concept but struggle with practical applications.",
        tags: ["javascript", "closures", "help"],
        replies: [
          {
            userId: instructors[0]._id,
            content:
              'Great question! A closure is when a function retains access to variables from its outer scope even after the outer function has returned. Here\'s a simple example:\n\nfunction outer(x) {\n  return function inner(y) {\n    return x + y;\n  };\n}\n\nconst addFive = outer(5);\nconsole.log(addFive(3)); // 8\n\nThe inner function "closes over" the variable x.',
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          },
          {
            userId: students[1]._id,
            content:
              "Thanks for the explanation! That makes it much clearer. So the inner function remembers the value of x even after outer() has finished?",
            createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          },
        ],
        likes: [students[1]._id, instructors[0]._id],
      },
      {
        courseId: courses[2]._id,
        userId: students[2]._id,
        title: "Best practices for React component structure?",
        content:
          "What are the best practices for organizing React components? Should I keep all components in one folder or separate them by feature?",
        tags: ["react", "best-practices", "organization"],
        replies: [
          {
            userId: instructors[1]._id,
            content:
              "Great question! I recommend organizing by feature for larger apps:\n\n/components\n  /common (shared components)\n  /user\n    UserProfile.jsx\n    UserList.jsx\n  /course\n    CourseCard.jsx\n    CourseDetail.jsx\n\nThis makes it easier to find and maintain related components.",
            createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          },
        ],
        likes: [students[0]._id, students[3]._id],
      },
      {
        courseId: courses[3]._id,
        userId: students[3]._id,
        title: "MongoDB vs SQL databases",
        content:
          "I come from a SQL background. What are the main advantages of using MongoDB over traditional SQL databases? When should I choose one over the other?",
        tags: ["mongodb", "sql", "database", "comparison"],
        replies: [
          {
            userId: instructors[1]._id,
            content:
              "Excellent question! MongoDB advantages:\n\n1. Flexible schema - easy to change data structure\n2. JSON-like documents - natural for JavaScript developers\n3. Horizontal scaling\n4. Fast development for agile projects\n\nUse SQL when you need:\n- Complex relationships\n- ACID transactions\n- Mature ecosystem\n- Strict data consistency\n\nChoose based on your specific use case!",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          },
          {
            userId: students[0]._id,
            content:
              "This is really helpful! I think MongoDB would be perfect for my current project since the requirements keep changing.",
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          },
        ],
        likes: [students[0]._id, students[1]._id, instructors[0]._id],
      },
      {
        courseId: courses[4]._id,
        userId: students[1]._id,
        title: "Deployment strategies for MERN stack",
        content:
          "What are the recommended deployment strategies for MERN stack applications? Should I deploy frontend and backend separately or together?",
        tags: ["deployment", "mern-stack", "devops"],
        replies: [
          {
            userId: instructors[0]._id,
            content:
              "For production, I recommend separate deployment:\n\n1. Frontend: Vercel, Netlify, or AWS S3 + CloudFront\n2. Backend: Heroku, AWS EC2, or DigitalOcean\n3. Database: MongoDB Atlas or AWS DocumentDB\n\nThis gives you better scalability and allows independent updates. For development, Docker Compose works great for running everything together.",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
        ],
        likes: [students[2]._id, students[3]._id],
      },
    ]);

    console.log("✅ Discussions seeded successfully");
    return discussions;
  } catch (error) {
    console.error("❌ Error seeding discussions:", error);
    throw error;
  }
};

module.exports = {
  seedUsers,
  seedCourses,
  seedAssessments,
  seedDiscussions,
};