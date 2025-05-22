import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { assessmentAPI, courseAPI } from "../Services/serviceApi";
import { FiSave, FiPlus, FiTrash, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

const AssessmentCreate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: courseId || "",
    timeLimit: 30,
    passingMarks: 60,
    weightage: 10, // Nilai kontribusi ke progress course
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 10,
      },
    ],
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Fetch only instructor's courses
        const coursesData = await courseAPI.getCoursesByInstructor(user.id);
        setCourses(coursesData || []);

        // If courseId is provided and valid, pre-select it
        if (courseId) {
          setFormData((prev) => ({ ...prev, courseId }));

          // Fetch course details to verify instructor has access
          try {
            const courseDetails = await courseAPI.getCourseById(courseId);
            if (courseDetails.instructor !== user.id) {
              toast.error(
                "You don't have permission to add assessments to this course"
              );
              navigate("/instructor/assessments");
            }
          } catch (err) {
            console.error("Error verifying course access:", err);
            toast.error("Failed to verify course access");
            navigate("/instructor/assessments");
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user.id, courseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const handleCorrectAnswerChange = (questionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].correctAnswer = parseInt(value);
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          points: 10,
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      toast.error("Assessment must have at least one question");
      return;
    }

    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.title || !formData.courseId) {
      toast.error("Please fill in all required fields");
      return false;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question) {
        toast.error(`Question ${i + 1} is empty`);
        return false;
      }

      // Check options
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j]) {
          toast.error(`Option ${j + 1} in question ${i + 1} is empty`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      // Create assessment - courseId is already included in formData
      const assessment = await assessmentAPI.createAssessment(formData);

      // No need for separate linking step

      toast.success("Assessment created successfully");

      // Navigate based on context
      if (courseId) {
        navigate(`/instructor/courses/${courseId}/assessments`);
      } else {
        navigate("/instructor/assessments");
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
      toast.error("Failed to create assessment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Assessment
          </h1>
          <p className="text-sm text-gray-600">
            Add a new assessment to your course
          </p>
        </div>
        <Link
          to={
            courseId
              ? `/instructor/courses/${courseId}/assessments`
              : "/instructor/assessments"
          }
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
        >
          <FiArrowLeft className="mr-2" /> Back to assessments
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Assessment Details</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="courseId"
                className="block text-sm font-medium text-gray-700"
              >
                Course *
              </label>
              <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
                disabled={!!courseId} // Disable if courseId is provided in URL
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="weightage"
                className="block text-sm font-medium text-gray-700"
              >
                Progress Weight (%)
              </label>
              <input
                type="number"
                id="weightage"
                name="weightage"
                value={formData.weightage}
                onChange={handleChange}
                min="1"
                max="100"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                How much this assessment contributes to course completion
              </p>
            </div>

            <div>
              <label
                htmlFor="timeLimit"
                className="block text-sm font-medium text-gray-700"
              >
                Time Limit (minutes)
              </label>
              <input
                type="number"
                id="timeLimit"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleChange}
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="passingMarks"
                className="block text-sm font-medium text-gray-700"
              >
                Passing Score (%)
              </label>
              <input
                type="number"
                id="passingMarks"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleChange}
                min="1"
                max="100"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="mr-1.5 h-4 w-4" />
              Add Question
            </button>
          </div>

          <div className="space-y-8">
            {formData.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    Question {qIndex + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="inline-flex items-center text-sm text-red-600 hover:text-red-900"
                  >
                    <FiTrash className="mr-1 h-4 w-4" />
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Question Text *
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "question", e.target.value)
                      }
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Options *
                    </label>
                    <div className="mt-1 space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center">
                          <input
                            type="radio"
                            checked={question.correctAnswer === oIndex}
                            onChange={() =>
                              handleCorrectAnswerChange(qIndex, oIndex)
                            }
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            required
                            className="ml-2 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Select the radio button for the correct answer
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Points
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "points",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      className="mt-1 w-24 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            to={
              courseId
                ? `/instructor/courses/${courseId}/assessments`
                : "/instructor/assessments"
            }
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiSave className="mr-2 -ml-1 h-5 w-5" />
            {saving ? "Saving..." : "Create Assessment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentCreate;
