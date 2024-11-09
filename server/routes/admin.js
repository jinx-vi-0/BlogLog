const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

const { validatePost } = require('../middlewares/authValidator');
const { CloudinaryStorage } = require('multer-storage-cloudinary');


const adminLayout = '../views/layouts/admin';
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'post',
    format: async (req, file) => 'jpeg', // Supports promises as well
    public_id: (req, file) =>
      Date.now() +
      '-' +
      file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 100),
  },
});

const upload = multer({ storage });


/**
 * GET /
 * Admin - Login Page
*/

router.use((req, res, next) => {
  res.locals.layout = './layouts/admin'; // Set the layout for the response
  next(); // Call the next middleware or route handler
});


/**
 * GET /dashboard
 * Admin Dashboard Route
 */
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  const locals = {
    title: 'Dashboard',
    user: req.cookies.token,
    description: 'Simple Blog created with NodeJs, Express & MongoDb.',
  };

  const posts = await Post.find(); // Fetch all posts

  res.render('admin/dashboard', { locals, posts });
});


/**
 * GET /add-post
 * Admin Add Post Route
 */
router.get('/add-post', authMiddleware, adminMiddleware, async (req, res) => {
  const token = req.cookies.token;

  try {
    const locals = {
      title: 'Add Post',
      user: token,
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    };

    res.render('admin/add-post', {locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /add-post
 * Admin Create New Post Route
 */
router.post('/add-post', upload.single('poster'), authMiddleware, adminMiddleware, validatePost, async (req, res) => {
  try {
    const token = req.cookies.token

    const newPost = new Post({
      title: req.body.title,
      user: token,
      body: req.body.body,
      author: req.body.author,
      poster: req.file ? await cloudinary.uploader.upload(req.file.path).then(r => r.secure_url) : null
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
router.get('/edit-post/:id', authMiddleware, adminMiddleware, async (req, res) => {
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
router.put('/edit-post/:id', upload.single('poster'), authMiddleware, adminMiddleware, validatePost, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      author: req.body.author,
      ...(req.file ? { poster: await cloudinary.uploader.upload(req.file.path).then(r => r.secure_url) } : {}),
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
router.delete('/delete-post/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;
