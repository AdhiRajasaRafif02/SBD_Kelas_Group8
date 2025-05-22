import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Error handler utility
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw new Error(error.response.data.message || "Server error occurred");
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error("No response from server");
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || "Request failed");
  }
};

// Create axios instance with withCredentials: true to send cookies
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is crucial for session-based auth
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default api;

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network Error:", error.message);
      toast.error("Network error. Please check your connection.");
    } else if (error.response.status === 401) {
      console.error("Authentication Error:", error.response.data);
      toast.error("Authentication required. Please log in again.");
      // Clear authentication data
      localStorage.removeItem("user");
      // Redirect to login if needed
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Add this utility function at the top of your file
const fetchWithRetry = async (fetchFunc, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFunc();
    } catch (error) {
      lastError = error;

      // If it's a rate limit error (429)
      if (error.response && error.response.status === 429) {
        // Wait with exponential backoff: 1s, 2s, 4s, etc.
        const delay = Math.pow(2, i) * 1000;
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // For other errors, don't retry
        throw error;
      }
    }
  }
  throw lastError;
};

// Add this to your existing exports at the bottom of the file
export const userAPI = {
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
};

// Add a simple cache mechanism
const cache = {
  courses: {},
  courseById: {},
  expiresIn: 60000, // 1 minute cache
};

// Course API
export const courseAPI = {
  getAllCourses: async (page = 1, limit = 10, search = "") => {
    try {
      const response = await api.get(
        `/courses?page=${page}&limit=${limit}&search=${search}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  getCourseById: async (id) => {
    return fetchWithRetry(async () => {
      try {
        // Check cache first
        if (
          cache.courseById[id] &&
          Date.now() - cache.courseById[id].timestamp < cache.expiresIn
        ) {
          console.log(`Using cached data for course ${id}`);
          return cache.courseById[id].data;
        }

        const res = await api.get(`/courses/${id}`);

        // Store in cache
        cache.courseById[id] = {
          data: res.data,
          timestamp: Date.now(),
        };

        return res.data;
      } catch (error) {
        console.error(`Error fetching course ${id}:`, error);
        throw error;
      }
    });
  },

  getCoursesByInstructor: async (instructorId) => {
    try {
      // Check cache first
      const cacheKey = `instructor_${instructorId}`;
      if (
        cache.courses[cacheKey] &&
        Date.now() - cache.courses[cacheKey].timestamp < cache.expiresIn
      ) {
        console.log(`Using cached data for instructor courses`);
        return cache.courses[cacheKey].data;
      }

      // First get all courses
      const response = await api.get("/courses");

      // Filter courses by instructor ID
      let result = [];
      if (response.data.courses) {
        result = response.data.courses.filter(
          (course) =>
            course.instructor?._id === instructorId ||
            course.instructor === instructorId
        );
      }

      // Store in cache
      cache.courses[cacheKey] = {
        data: result,
        timestamp: Date.now(),
      };

      return result;
    } catch (error) {
      console.error(`Error fetching instructor courses:`, error);
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  },

  enrollInCourse: async (courseId) => {
    try {
      const res = await api.post(`/courses/${courseId}/enroll`);
      return res.data;
    } catch (error) {
      console.error(`Error enrolling in course ${courseId}:`, error);
      throw error;
    }
  },

  createCourse: async (courseData) => {
    try {
      const res = await api.post("/courses", courseData);
      return res.data;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  linkAssessmentToCourse: async (courseId, assessmentId) => {
    try {
      const response = await api.post(
        `/courses/${courseId}/assessments/${assessmentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error linking assessment to course:", error);
      throw error;
    }
  },
};

// Assessment API
export const assessmentAPI = {
  getAllAssessments: async () => {
    try {
      console.log("Fetching all assessments...");
      const res = await api.get("/assessments");
      console.log("Assessments received:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching assessments:", error);
      // Return empty array instead of throwing
      return [];
    }
  },

  getAssessmentById: async (id) => {
    try {
      console.log(`Fetching assessment ${id}...`);
      const res = await api.get(`/assessments/${id}`);
      console.log("Assessment data received:", res.data);

      // Transform the data structure to match frontend expectations
      if (res.data && res.data.questions) {
        const transformedQuestions = res.data.questions.map((q) => ({
          text: q.questionText,
          type: "multiple-choice",
          options: q.options.map((o) => o.optionText),
        }));

        return {
          ...res.data,
          questions: transformedQuestions,
        };
      }

      return res.data;
    } catch (error) {
      console.error(`Error fetching assessment ${id}:`, error);
      throw error;
    }
  },

  createAssessment: async (assessmentData) => {
    try {
      // Calculate total marks based on question points
      const totalMarks = assessmentData.questions.reduce(
        (sum, question) => sum + (question.points || 10),
        0
      );

      // Transform the data to match backend schema
      const transformedData = {
        ...assessmentData,
        totalMarks: totalMarks,
        questions: assessmentData.questions.map((question) => ({
          questionText: question.question,
          options: question.options.map((option, index) => ({
            optionText: option,
            isCorrect: index === question.correctAnswer,
          })),
        })),
      };

      console.log(
        "Creating assessment with transformed data:",
        transformedData
      );
      const response = await api.post("/assessments", transformedData);
      return response.data;
    } catch (error) {
      console.error("Error creating assessment:", error);
      throw error;
    }
  },

  updateAssessment: async (id, assessmentData) => {
    try {
      console.log(`Updating assessment ${id}:`, assessmentData);
      const res = await api.put(`/assessments/${id}`, assessmentData);
      console.log("Assessment updated:", res.data);
      return res.data;
    } catch (error) {
      console.error(`Error updating assessment ${id}:`, error);
      throw error;
    }
  },

  deleteAssessment: async (id) => {
    try {
      console.log(`Deleting assessment ${id}...`);
      const res = await api.delete(`/assessments/${id}`);
      console.log("Assessment deleted");
      return true;
    } catch (error) {
      console.error(`Error deleting assessment ${id}:`, error);
      throw error;
    }
  },

  submitAssessment: async (assessmentId, data) => {
    try {
      // Transform data format to match backend expectations
      let transformedData = data;

      if (
        data.answers &&
        Array.isArray(data.answers) &&
        data.answers[0]?.questionId
      ) {
        // Convert from [{questionId, answer}] to simple array format
        const assessment = await api.get(`/assessments/${assessmentId}`);
        const questions = assessment.data.questions;

        // Create array of answers matching the question order
        const simpleAnswers = questions.map((q) => {
          const answerObj = data.answers.find((a) => a.questionId === q._id);
          return answerObj ? answerObj.answer : "";
        });

        transformedData = { answers: simpleAnswers };
      }

      const response = await api.post(
        `/assessments/${assessmentId}/submit`,
        transformedData
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting assessment:", error);
      throw error;
    }
  },

  getAssessmentsByCourse: async (courseId) => {
    try {
      // Coba cara 1: endpoint khusus jika ada
      try {
        const response = await api.get(`/assessments/course/${courseId}`);
        return response.data;
      } catch (err) {
        // Jika endpoint tidak ada, coba cara 2: filter dari semua assessment
        const allAssessments = await api.get("/assessments");
        return allAssessments.data.filter(
          (assessment) =>
            assessment.courseId === courseId ||
            assessment.courseId?._id === courseId
        );
      }
    } catch (error) {
      console.error(
        `Error fetching assessments for course ${courseId}:`,
        error
      );
      return [];
    }
  },
};

// Discussion API
export const discussionAPI = {
  getDiscussions: async () => {
    try {
      const response = await api.get('/discussions');
      return response.data;
    } catch (error) {
      console.error('Error fetching discussions:', error);
      throw error;
    }
  },
  getDiscussionsByCourse: async (courseId) => {
    try {
      const response = await api.get(`/discussions/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course discussions:', error);
      throw error;
    }
  },

  getDiscussion: async (id) => {
    try {
      const response = await api.get(`/discussions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching discussion:', error);
      throw error;
    }
  },

  createDiscussion: async (data) => {
    try {
      const response = await api.post('/discussions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  },

  addReply: async (discussionId, data) => {
    try {
      const response = await api.post(`/discussions/${discussionId}/replies`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  },

  likeDiscussion: async (discussionId) => {
    try {
      const response = await api.post(`/discussions/${discussionId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking discussion:', error);
      throw error;
    }
  },

  deleteDiscussion: async (discussionId) => {
    try {
      const response = await api.delete(`/discussions/${discussionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting discussion:', error);
      throw error;
    }
  },

  updateDiscussion: async (discussionId, data) => {
    try {
      const response = await api.put(`/discussions/${discussionId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating discussion:', error);
      throw error;
    }
  },
};

// Progress API
export const progressAPI = {
  getUserProgress: async (userId, courseId) => {
    try {
      const response = await api.get(
        `/progress/user/${userId}/course/${courseId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user progress:", error);
      throw error;
    }
  },

  updateUserProgress: async (userId, courseId, progressData) => {
    try {
      const response = await api.put(
        `/progress/user/${userId}/course/${courseId}`,
        progressData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user progress:", error);
      throw error;
    }
  },

  getUserAverageScore: async (userId) => {
    try {
      const response = await api.get(`/progress/user/${userId}/average-score`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user average score:", error);
      throw error;
    }
  },

  getCourseRanking: async (courseId) => {
    try {
      const response = await api.get(`/progress/course/${courseId}/ranking`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ranking:`, error);
      return [];
    }
  },

  getCourseStatistics: async () => {
    try {
      const response = await api.get("/progress/course/statistics");
      return response.data;
    } catch (error) {
      console.error("Error fetching course statistics:", error);
      throw error;
    }
  },
};
