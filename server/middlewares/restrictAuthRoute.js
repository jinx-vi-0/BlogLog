module.exports = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return next();
    return res.status(200).redirect('/')
}