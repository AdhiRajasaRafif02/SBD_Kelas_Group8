import { Link } from "react-router-dom";
import { FiAlertTriangle, FiHome, FiArrowLeft } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-xl mx-auto text-center px-4 py-16">
        <div className="flex justify-center">
          <FiAlertTriangle className="h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-10 flex justify-center space-x-4">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiHome className="mr-2" /> Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
