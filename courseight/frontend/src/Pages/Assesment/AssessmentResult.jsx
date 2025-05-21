import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiX,
  FiChevronLeft,
  FiAward,
  FiArrowRight,
} from "react-icons/fi";
import toast from "react-hot-toast";

const AssessmentResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        // In a real app, you would fetch from API
        // const response = await axios.get(`/api/assessments/${id}/results`);
        // setResults(response.data);

        // Mock data for demonstration
        const mockResults = {
          assessmentId: id,
          title: "JavaScript Fundamentals Quiz",
          courseName: "Web Development Fundamentals",
          courseId: "course123",
          score: 80,
          maxScore: 100,
          passingScore: 60,
          completedAt: "2023-06-30T15:30:00Z",
          timeSpent: 28, // minutes
          questionResults: [
            {
              id: "q1",
              question:
                "What is the correct way to declare a JavaScript variable?",
              userAnswer: "a",
              correctAnswer: "a",
              isCorrect: true,
              explanation:
                "In JavaScript, variables can be declared using var, let, or const keywords.",
            },
            {
              id: "q2",
              question: "Which of the following is NOT a JavaScript data type?",
              userAnswer: "a",
              correctAnswer: "c",
              isCorrect: false,
              explanation:
                "JavaScript has 7 primitive data types: String, Number, BigInt, Boolean, undefined, Symbol, and null. Object is a non-primitive type. Float is not a distinct data type in JavaScript.",
            },
            {
              id: "q3",
              question:
                "What will the following code return: console.log(typeof([]));",
              userAnswer: "b",
              correctAnswer: "b",
              isCorrect: true,
              explanation:
                "Arrays in JavaScript are objects, so typeof([]) returns 'object'.",
            },
            {
              id: "q4",
              question: "Explain how closures work in JavaScript.",
              userAnswer:
                "A closure is when a function can remember and access variables from its outer scope.",
              correctAnswer:
                "A closure is the combination of a function and the lexical environment within which that function was declared.",
              isCorrect: true,
              explanation:
                "Your answer captured the core concept of closures correctly.",
            },
          ],
          feedback:
            "Good job! You've demonstrated a solid understanding of JavaScript fundamentals. Focus on reviewing data types for improvement.",
        };

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call delay
        setResults(mockResults);
      } catch (error) {
        console.error("Error fetching assessment results:", error);
        toast.error("Failed to load assessment results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Results not found</h2>
        <p className="mt-2 text-gray-600">
          The assessment results you're looking for don't exist or have been
          removed.
        </p>
        <Link
          to="/assessments"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Assessments
        </Link>
      </div>
    );
  }

  const isPassed = results.score >= results.passingScore;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with assessment info and score */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate("/assessments")}
              className="text-white hover:text-indigo-100 flex items-center text-sm"
            >
              <FiChevronLeft className="mr-1" /> Back to Assessments
            </button>
            <span className="text-sm">
              Completed on: {formatDate(results.completedAt)}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{results.title}</h1>
          <p>{results.courseName}</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mr-6">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      results.score,
                      results.maxScore
                    )}`}
                  >
                    {results.score}
                  </div>
                  <div className="text-xs text-gray-500">
                    out of {results.maxScore}
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isPassed ? "Congratulations!" : "Almost there!"}
                </h2>
                <p className="text-gray-600">
                  {isPassed
                    ? `You've passed with a score of ${results.score}/${results.maxScore}`
                    : `You've scored ${results.score}/${results.maxScore}, the passing score is ${results.passingScore}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Time spent: {results.timeSpent} minutes
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              {isPassed ? (
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
                  <FiAward className="h-8 w-8" />
                </div>
              ) : (
                <div className="text-yellow-600">
                  <button
                    onClick={() => navigate(`/assessments/${id}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Retry Assessment
                  </button>
                </div>
              )}
            </div>
          </div>

          {results.feedback && (
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
              <h3 className="text-md font-medium text-blue-800">
                Instructor Feedback
              </h3>
              <p className="mt-1 text-sm text-blue-700">{results.feedback}</p>
            </div>
          )}
        </div>
      </div>

      {/* Question review */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Question Review</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {results.questionResults.map((result, index) => (
            <div key={result.id} className="p-6">
              <div className="flex items-start">
                <div
                  className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                    result.isCorrect ? "bg-green-100" : "bg-red-100"
                  } mr-3`}
                >
                  {result.isCorrect ? (
                    <FiCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <FiX className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-md font-medium text-gray-900">
                    Question {index + 1}: {result.question}
                  </h3>

                  <div className="mt-3 mb-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Your answer:{" "}
                      </span>
                      <span
                        className={
                          result.isCorrect ? "text-green-600" : "text-red-600"
                        }
                      >
                        {typeof result.userAnswer === "string" &&
                        result.userAnswer.length === 1
                          ? `Option ${result.userAnswer.toUpperCase()}`
                          : result.userAnswer}
                      </span>
                    </div>

                    {!result.isCorrect && (
                      <div className="text-sm mt-1">
                        <span className="font-medium text-gray-700">
                          Correct answer:{" "}
                        </span>
                        <span className="text-green-600">
                          {typeof result.correctAnswer === "string" &&
                          result.correctAnswer.length === 1
                            ? `Option ${result.correctAnswer.toUpperCase()}`
                            : result.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>

                  {result.explanation && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      <span className="font-medium">Explanation: </span>
                      {result.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Next Steps</h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to={`/courses/${results.courseId}`}
            className="flex items-center p-4 border rounded-md hover:bg-gray-50"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Continue course</h3>
              <p className="text-sm text-gray-500">
                Return to your course content
              </p>
            </div>
            <FiArrowRight className="h-5 w-5 text-gray-400" />
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center p-4 border rounded-md hover:bg-gray-50"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">View your progress</h3>
              <p className="text-sm text-gray-500">
                Track your overall learning journey
              </p>
            </div>
            <FiArrowRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
