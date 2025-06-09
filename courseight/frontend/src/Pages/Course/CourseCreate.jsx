import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { courseAPI } from "../Services/serviceApi";
import { FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const CourseCreate = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "beginner",
    category: "programming",
    duration: "4 weeks",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("User data:", user); // Debug user data

    if (!user || !user.id) {
      toast.error("User data not available, please login again");
      navigate("/login");
      return;
    }

    if (!formData.title || formData.title.length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }

    try {
      setLoading(true);

      // Use only the form data without adding instructor field
      // The backend will get the instructor from the authentication token
      await courseAPI.createCourse(formData);

      toast.success("Course created successfully");
      navigate("/instructor/courses");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(
        "Failed to create course: " +
          (error.response?.data?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Course
          </h1>
          <p className="text-sm text-gray-600">
            Fill in the details to create a new course
          </p>
        </div>
        <Link
          to="/instructor/courses"
          className="flex items-center text-indigo-600 hover:text-indigo-900"
        >
          <FiArrowLeft className="mr-1" />
          Back to Courses
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g. Introduction to Web Development"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Course Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="Provide a detailed description of what students will learn in this course"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="level"
                className="block text-sm font-medium text-gray-700"
              >
                Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="personal-development">
                  Personal Development
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duration
              </label>
              <input
                type="text"
                name="duration"
                id="duration"
                value={formData.duration}
                onChange={handleChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g. 4 weeks"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Link
              to="/instructor/courses"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiX className="mr-2 h-5 w-5" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <FiSave className="mr-2 h-5 w-5" />
              {loading ? "Saving..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseCreate;
