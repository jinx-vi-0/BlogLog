const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;


module.exports = (req, res, next) => {
    const token = req.cookies.user.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = { id: decoded.id, username: decoded.username, admin: decoded.admin };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}