import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { assessmentAPI, progressAPI } from "../Services/serviceApi";
import { FiClock, FiAlertTriangle, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setLoading(true);

        // Fetch assessment data
        const data = await assessmentAPI.getAssessmentById(id);
        setAssessment(data);

        // Initialize time limit
        if (data.timeLimit) {
          setTimeLeft(data.timeLimit * 60); // Convert to seconds
        }

        // Initialize answers
        if (data.questions) {
          const initialAnswers = {};
          data.questions.forEach((q) => {
            initialAnswers[q._id] = "";
          });
          setAnswers(initialAnswers);
        }

        // Check if user has already submitted this assessment
        if (data.results) {
          const userSubmission = data.results.find(
            (result) => result.userId === user.id
          );
          if (userSubmission) {
            setHasSubmitted(true);
            // Redirect to results if already submitted
            toast.error("You have already submitted this assessment");
            navigate(`/assessments/result/${id}`);
          }
        }
      } catch (error) {
        console.error("Error fetching assessment details:", error);
        toast.error("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [id, user.id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0 || !assessment) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, assessment]);

  const handleAutoSubmit = () => {
    if (!submitting) {
      toast.error("Time's up! Your assessment is being submitted.");
      handleSubmit();
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (hasSubmitted) {
      toast.error("You have already submitted this assessment");
      return;
    }

    if (submitting) return;

    // Check if all questions are answered
    const unansweredCount = Object.values(answers).filter(
      (a) => a === ""
    ).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);

      // Format answer data
      const answerData = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      // Submit assessment
      const result = await assessmentAPI.submitAssessment(id, {
        answers: answerData,
      });

      // Update progress for the course
      if (assessment.courseId) {
        try {
          await progressAPI.updateUserProgress(user.id, assessment.courseId);
        } catch (err) {
          console.error("Error updating progress:", err);
        }
      }

      // Mark as submitted to prevent double submission
      setHasSubmitted(true);

      // Navigate to results
      navigate(`/assessments/result/${id}`);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Assessment not found
        </h2>
        <p className="mt-2 text-gray-600">
          The assessment you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  // Get the current question
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
            Course: {course?.title || "Course Assessment"}
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
            <span>
              {answers[currentQuestion] ? "Answered" : "Not answered"}
            </span>
          </div>

          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {question?.text ||
              question?.question ||
              "No question text available"}
          </h2>

          {/* Multiple choice question */}
          {question?.type === "multiple-choice" &&
            question?.options?.length > 0 && (
              <div className="space-y-4">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`block p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                      answers[currentQuestion] === optionIndex.toString()
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={optionIndex.toString()}
                        checked={
                          answers[currentQuestion] === optionIndex.toString()
                        }
                        onChange={() =>
                          handleAnswerChange(
                            currentQuestion,
                            optionIndex.toString()
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-3 text-gray-700">
                        {option.text || option || `Option ${optionIndex + 1}`}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}

          {/* Text/essay question */}
          {(!question?.type ||
            question?.type === "text" ||
            question?.type === "essay") && (
            <div>
              <textarea
                rows="6"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Type your answer here..."
                value={answers[currentQuestion] || ""}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion, e.target.value)
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
                disabled={submitting}
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  submitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? "Submitting..." : "Submit Assessment"}
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
