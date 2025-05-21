import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { assessmentAPI } from "../Services/api";
import { FiClock, FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const data = await assessmentAPI.getAssessmentById(id);
        setAssessment(data);

        // Initialize answers array with empty values
        setAnswers(new Array(data.questions.length).fill(""));

        // Set time limit in seconds
        if (data.timeLimit) {
          setTimeLeft(data.timeLimit * 60);
        }
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast.error("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  // Move to next or previous question
  const handleNextQuestion = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Submit assessment
  const handleSubmit = async (isTimeout = false) => {
    if (
      !isTimeout &&
      !confirm("Are you sure you want to submit this assessment?")
    ) {
      return;
    }

    try {
      setSubmitting(true);
      const result = await assessmentAPI.submitAssessment(id, answers);
      toast.success(
        isTimeout
          ? "Time's up! Assessment submitted automatically."
          : "Assessment submitted successfully!"
      );
      navigate(`/assessments/result/${id}`, { state: { result } });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center p-8">
        <FiAlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-4 text-xl font-medium text-gray-900">
          Assessment not found
        </h2>
        <p className="mt-2 text-gray-500">
          The assessment you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const question = assessment.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">{assessment.title}</h1>
            <div className="flex items-center bg-indigo-700 px-3 py-1 rounded text-white">
              <FiClock className="mr-2" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <p className="text-indigo-200 text-sm mt-1">
            Course: {assessment.courseName}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-indigo-600 h-1"
            style={{
              width: `${
                ((currentQuestion + 1) / assessment.questions.length) * 100
              }%`,
            }}
          ></div>
        </div>

        {/* Question */}
        <div className="px-6 py-8">
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>
              Question {currentQuestion + 1} of {assessment.questions.length}
            </span>
            {question.type === "multiple-choice" && (
              <span>{answers[question.id] ? "Answered" : "Not answered"}</span>
            )}
          </div>

          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {question.text}
          </h2>

          {question.type === "multiple-choice" && (
            <div className="space-y-4">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`block p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                    answers[question.id] === option.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() =>
                        handleAnswerChange(question.id, option.id)
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{option.text}</span>
                  </div>
                </label>
              ))}
            </div>
          )}

          {question.type === "text" && (
            <div>
              <textarea
                rows="6"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Type your answer here..."
                value={answers[question.id] || ""}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
              ></textarea>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between">
          <button
            onClick={() => navigateQuestion("prev")}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 border rounded-md text-sm font-medium ${
              currentQuestion === 0
                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>

          <div>
            {currentQuestion === assessment.questions.length - 1 ? (
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Assessment"}
              </button>
            ) : (
              <button
                onClick={() => navigateQuestion("next")}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetail;
