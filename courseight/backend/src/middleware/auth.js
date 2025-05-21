const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Check if user is logged in via session
        if (!req.session.userId || !req.session.isLoggedIn) {
            return res.status(401).send({ error: 'Please authenticate.' });
        }

        // Find the user in the database
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(401).send({ error: 'Please authenticate.' });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = authMiddleware;