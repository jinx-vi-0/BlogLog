const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;
const {z} = require('zod');

/**
 * Middleware to check authentication
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/admin'); // Redirect if no token is found
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.redirect('/admin'); // Redirect on token verification failure
  }
};

/**
 * GET /admin
 * Admin - Login Page
 */
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };


    const userId = req.userId; // Get the userId from the auth middleware
    res.render('admin/index', { locals, layout: adminLayout, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /admin
 * Admin - Check Login
 */
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /dashboard
 * Admin Dashboard
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Get the userId from the auth middleware
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
      userId
    };

    const data = await Post.find();

    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



/**
 * GET /add-post
 * Admin - Create New Post
 */
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
      userId
    };

     // Get the userId

    res.render('admin/add-post', {
      locals,
      layout: adminLayout
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


/**
 * POST /add-post
 * Admin - Create New Post
 */
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Assuming you set req.userId in the authMiddleware

    const newPost = await Post.create({
      title: req.body.title,
      body: req.body.body,
      user: userId // Set the user reference
    });

    await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });
    res.redirect('/dashboard');
  } catch (error) {
    console.error("Error in adding post:", error); // Log the error
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




/**
 * GET /edit-post/:id
 * Admin - Edit Post
 */
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "Edit your post details."
    };

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.render('admin/edit-post', {
      locals,
      data: post,
      layout: adminLayout
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * PUT /edit-post/:id
 * Admin - Update Post
 */
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /register
 * Admin - Register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminValidationSchema=z.object({
      username: z.string().min(6).max(20),
      password:z.string().min(6).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,"Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character")
  })
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.redirect('/users'); // Adjust to redirect correctly after registration
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      res.status(409).json({ message: 'User already in use' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    const parseData= adminValidationSchema.safeParse(req.body);
    if(!parseData.success){
        res.status(403).json(parseData.error);
        return
    }

    try {
      const user = await User.create({ username, password:hashedPassword });
      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).json({ message: 'User already in use'});
      }
      res.status(500).json({ message: 'Internal server error'})
    }
  }
});

/**
 * GET /users
 * Admin - Manage Users Page
 */
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find();

    const locals = {
      title: 'Manage Users',
      description: 'Manage your application users here.'
    };

    res.render('admin/manage-users', {
      locals,
      users,
      layout: adminLayout
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/profile/:id', authMiddleware,async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch the user by ID and populate their posts
    const user = await User.findById(userId).populate('posts');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const locals = {
      title: `${user.username}'s Profile`,
      description: "User profile showing all posts.",
    };

    res.render('admin/profile', { 
      locals,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


/**
 * DELETE /delete-post/:id
 * Admin - Delete Post
 */
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /logout
 * Admin Logout
 */
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/'); // Redirect to login or home page
});

module.exports = router;
