import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with withCredentials: true to send cookies
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is crucial for session-based auth
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

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

// Course API
export const courseAPI = {
  getAllCourses: async (page = 1, limit = 10, search = "") => {
    try {
      const res = await api.get(
        `/courses?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching courses:", error);
      return { courses: [], pagination: { page, limit, total: 0, pages: 1 } };
    }
  },

  getCourseById: async (id) => {
    try {
      const res = await api.get(`/courses/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error;
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
};

// Assessment API
export const assessmentAPI = {
  getAllAssessments: async () => {
    try {
      const res = await api.get("/assessments");
      return res.data;
    } catch (error) {
      console.error("Error fetching assessments:", error);
      throw error;
    }
  },

  getAssessmentById: async (id) => {
    try {
      const res = await api.get(`/assessments/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching assessment ${id}:`, error);
      throw error;
    }
  },

  submitAssessment: async (id, answers) => {
    try {
      const res = await api.post(`/assessments/${id}/submit`, { answers });
      return res.data;
    } catch (error) {
      console.error(`Error submitting assessment ${id}:`, error);
      throw error;
    }
  },

  getUserAssessments: async (userId) => {
    try {
      // Get all assessments (we'll filter by user on client side since backend doesn't expose this endpoint)
      const res = await api.get(`/assessments`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching user assessments:`, error);
      throw error;
    }
  },
};

// Discussion API
export const discussionAPI = {
  getAllDiscussions: async () => {
    try {
      const res = await api.get("/discussions");
      return res.data;
    } catch (error) {
      console.error("Error fetching discussions:", error);
      throw error;
    }
  },

  getDiscussionById: async (id) => {
    try {
      const res = await api.get(`/discussions/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching discussion ${id}:`, error);
      throw error;
    }
  },

  createDiscussion: async (data) => {
    try {
      const res = await api.post("/discussions", data);
      return res.data;
    } catch (error) {
      console.error("Error creating discussion:", error);
      throw error;
    }
  },

  getDiscussionsByCourse: async (courseId) => {
    try {
      const res = await api.get(`/discussions/course/${courseId}`);
      return res.data;
    } catch (error) {
      console.error(
        `Error fetching discussions for course ${courseId}:`,
        error
      );
      throw error;
    }
  },

  addResponse: async (discussionId, content) => {
    try {
      const res = await api.post(`/discussions/${discussionId}/responses`, {
        content,
      });
      return res.data;
    } catch (error) {
      console.error(
        `Error adding response to discussion ${discussionId}:`,
        error
      );
      throw error;
    }
  },
};

// Progress API
export const progressAPI = {
  getUserProgress: async (userId, courseId) => {
    try {
      const res = await api.get(`/progress/user/${userId}/course/${courseId}`);
      return res.data;
    } catch (error) {
      console.error(
        `Error fetching progress for user ${userId} in course ${courseId}:`,
        error
      );
      throw error;
    }
  },

  getUserAverageScore: async (userId) => {
    try {
      const res = await api.get(`/progress/user/${userId}/average-score`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching average score for user ${userId}:`, error);
      throw error;
    }
  },

  getCourseRanking: async (courseId) => {
    try {
      const res = await api.get(`/progress/course/${courseId}/ranking`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching ranking for course ${courseId}:`, error);
      throw error;
    }
  },

  getCourseStatistics: async () => {
    try {
      const res = await api.get(`/progress/course/statistics`);
      return res.data;
    } catch (error) {
      console.error("Error fetching course statistics:", error);
      throw error;
    }
  },
};

export default api;
