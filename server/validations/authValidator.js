const { body, validationResult } = require('express-validator');

// Validation middleware for registration
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Username can only contain letters and numbers')
    .escape(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character')
    .escape(),

  // Middleware to handle validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/register');
    }
    next();
  }
];

// Validation middleware for posts
const validatePost = [
  body('title')
  .trim()
  .notEmpty()
  .withMessage('Title is required')
  .isLength({ max: 200 })
  .withMessage('Title must not exceed 200 characters')
  .escape(),

  body('body')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .escape(),

  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author name is required')
    .escape(),

  (req, res, next) => {
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('admin/add-post', {message: errors });
    } else next();
  }
];

// Validation middleware for contact form
const validateContact = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters')
    .escape(),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must not exceed 1000 characters')
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('contact', {
        currentRoute: '/contact',
        message: errors.array()[0].msg,
        user: req.cookies.token
      });
    }
    next();
  }
];

module.exports = {
  validateRegistration,
  validatePost,
  validateContact
};