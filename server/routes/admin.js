const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');  // Added passport import

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;
const { z } = require('zod');

/**
 * Check whether the user is signed in or not 
 * and makes the /admin route available only those users who are NOT logged
 */

const restrictAuthRouteMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next();
  return res.status(200).redirect('/')
}


/**
 * Authentication Middleware
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

/**
 * GET /
 * Admin - Login Page
*/

router.use((req, res, next) => {
  res.locals.layout = './layouts/admin'; // Set the layout for the response
  next(); // Call the next middleware or route handler
});

router.get('/admin', restrictAuthRouteMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Admin',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    };

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /admin
 * Admin Login Route with Passport Authentication
 */
router.post('/admin', async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.logIn(user, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }

      const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      return res.redirect('/dashboard'); // Now redirect to dashboard
    });
  })(req, res, next);
});


/**
 * GET /dashboard
 * Admin Dashboard Route
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  const locals = {
    title: 'Dashboard',
    user: req.cookies.token,
    description: 'Simple Blog created with NodeJs, Express & MongoDb.',
  };

  const posts = await Post.find(); // Fetch all posts

  res.render('admin/dashboard', { locals, posts }); // Pass 'posts' to the template
});


/**
 * GET /add-post
 * Admin Add Post Route
 */
router.get('/add-post', authMiddleware, async (req, res) => {
  const token = req.cookies.token;
  try {
    const locals = {
      title: 'Add Post',
      user: token,
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    };

    res.render('admin/add-post', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /add-post
 * Admin Create New Post Route
 */
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const token = req.cookies.token
    const newPost = new Post({
      title: req.body.title,
      user: token,
      body: req.body.body,
    });


    await Post.create(newPost);
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /edit-post/:id
 * Admin Edit Post Route
 */
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Edit Post',
      user : req.cookies.token,
      description: 'Free NodeJs User Management System',
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * PUT /edit-post/:id
 * Admin Update Post Route
 */
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});

/**
 * DELETE /delete-post/:id
 * Admin Delete Post Route
 */
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /register
 * Admin Registration Route
 */

/**
 * GET /register
 * Admin - Registration Page
*/
// Example of admin.js route handling
router.get('/register',restrictAuthRouteMiddleware, (req, res) => {
  // Initialize messages object, you can adjust it according to your error handling logic
  const locals = {
    title: 'Admin',
    description: 'Simple Blog created with NodeJs, Express & MongoDb.',
  };

  res.render('admin/register', { locals, layout: adminLayout }); // Pass messages to the template
});



router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Simple validation
  if (!username || !password) {
    req.flash('error', 'All fields are required');
    return res.redirect('/register'); // Change to '/register'
  }

  if (!/^[a-zA-Z0-9]+$/.test(username) || username.length < 3) {
    req.flash('error', 'Username must be at least 3 characters long and contain only alphanumeric characters.');
    return res.redirect('/register');
  }

  if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
    req.flash('error', 'Password must be at least 8 characters long, contain a number, and a special character.');
    return res.redirect('/register');
  }

  try {
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      req.flash('error', 'Username already taken');
      return res.redirect('/register'); // Change to '/register'
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    // Automatically log the user in
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Error logging in after registration' });

      const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      
      return res.redirect('/dashboard');
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


/**
 * GET /logout
 * Admin Logout Route
 */
router.get('/logout', (req, res) => {

  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie('token');
    res.redirect('/');
  });
});

module.exports = router;
