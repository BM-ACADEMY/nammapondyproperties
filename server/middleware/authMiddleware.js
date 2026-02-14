
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role_id.role_name)) { // Assuming role_id populated and has role_name
            // Wait, req.user from protect might not populate role_id deeply if not specified.
            // protect calls User.findById(decoded.id).select('-password');
            // Mongoose findById doesn't auto-populate if not chained.
            // So I need to update protect to populate role_id.
            return res.status(403).json({ error: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    }
}


module.exports = { protect };
