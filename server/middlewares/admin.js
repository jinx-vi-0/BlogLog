module.exports = (req, res, next) => {
    try {
        if (req.user.admin) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}