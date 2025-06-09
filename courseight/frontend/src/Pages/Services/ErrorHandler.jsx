import { FiAlertTriangle } from "react-icons/fi";

const ErrorHandler = ({ message, onRetry }) => {
  return (
    <div className="text-center p-8 bg-red-50 rounded-lg">
      <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500" />
      <h2 className="mt-4 text-xl font-medium text-gray-900">
        Something went wrong
      </h2>
      <p className="mt-2 text-gray-500">
        {message || "Failed to load data from the server."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorHandler;
