const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Check if session exists
        if (!req.session) {
            return res.status(401).json({
                message: 'Authentication failed',
                error: 'Session not initialized'
            });
        }

        // Check if user is logged in via session
        if (!req.session.userId || !req.session.isLoggedIn) {
            return res.status(401).json({
                message: 'Authentication required',
                error: 'Please log in to access this resource'
            });
        }

        // Find the user in the database
        const user = await User.findById(req.session.userId);

        if (!user) {
            // Clear invalid session
            req.session.destroy();
            return res.status(401).json({
                message: 'Authentication failed',
                error: 'User not found'
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            message: 'Authentication failed',
            error: 'An error occurred during authentication'
        });
    }
};

module.exports = authMiddleware;