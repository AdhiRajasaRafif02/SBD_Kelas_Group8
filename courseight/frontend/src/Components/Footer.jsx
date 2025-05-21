import { Link } from "react-router-dom";
import { FiGithub, FiInstagram, FiTwitter, FiLinkedin } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <span className="font-bold text-xl">
              Course<span className="text-blue-400">Eight</span>
            </span>
            <p className="mt-2 text-sm text-gray-300">
              Unlocking knowledge and potential through interactive learning
              experiences.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FiGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/courses"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  All Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/assessments"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Assessments
                </Link>
              </li>
              <li>
                <Link
                  to="/discussions"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Discussion Forums
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} CourseEight. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
