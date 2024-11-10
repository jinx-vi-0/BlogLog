const express = require('express');
const passport = require('passport');

const router = express.Router();

const Post = require('../models/Post');
const User = require('../models/User');
const Tag = require('../models/Tag');
const ContactMessage = require('../models/contactMessage');

const transporter = require('../config/nodemailerConfig');
const { validateContact, validateRegistration } = require('../middlewares/authValidator');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Types: { ObjectId } } = require('mongoose')

const jwtSecret = process.env.JWT_SECRET;


router.use((req, res, next) => {
  res.locals.layout = './layouts/main'; // Set the layout for the response
  next(); // Call the next middleware or route handler
});


router.get('/posts', async (req, res) => {
  try {
    const locals = {
      title: "All Posts",
      user: req.cookies.user,
      description: "Made with ❤️"
    };

    const perPage = 10;
    const page = parseInt(req.query.page) || 1;

    let query = {};

    if (req.query.search) {
      const searchNoSpecialChar = req.query.search.replace(/[^a-zA-Z0-9 ]/g, "");

      query = {
        $or: [
          { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
          { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
        ]
      }
    }


    if (req.query.tags) {
      const tagIds = req.query.tags.split(',').map(id => new ObjectId(id));
      query.tags = { $in: tagIds };
    }

    console.log(query.tags)

    const data = await Post.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: (perPage * page) - perPage },
      { $limit: perPage }
    ]).exec()

    const tags = await Tag.find()

    const count = await Post.countDocuments(query);

    res.render('posts', {
      locals,
      data,
      tags,
      currentRoute: 'posts',
      search: req.query.search,
      pagination: {
        current: page,
        total: Math.ceil(count / perPage)
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/', async (req, res) => {
  try {
    const locals = {
      title: "BlogLog",
      user: req.cookies.user,
      description: "Made with ❤️"
    }

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .limit(5)
      .exec();

    res.render('index', {
      locals,
      data,
      currentRoute: '/'
    });

  } catch (error) {
    console.log(error);
  }

});


/**
 * GET /
 * Post :id
*/
router.get('/post/:id', async (req, res) => {
  try {
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug }).populate('tags');

    const locals = {
      title: data.title,
      user: req.cookies.user,
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    }

    res.render('post', {
      locals,
      data,
      currentRoute: `/post/${slug}`
    });
  } catch (error) {
    console.log(error);
  }

});


/**
 * GET /
 * About
*/
router.get('/about', (req, res) => {
  res.render('about', {
    user: req.cookies.token,
    currentRoute: '/about'
  });
});

/**
 * GET /
 * Contact
*/
router.get('/contact', (req, res) => {
  res.render('contact', {
    user: req.cookies.token,
    currentRoute: '/contact'
  });
});

router.post('/send-message', validateContact, async (req, res) => {
  const { name, email, message } = req.body;

  try {
    ``
    // Create a new contact message
    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();

    // Send an email notification
    const mailOptions = {
      from: `"BlogLog Contact Form" <${email}>`,
      to: process.env.EMAIL_USERNAME,
      subject: `New Contact Message from ${name} - BlogLog`,
      html: `
        <div style="font-family: Arial, sans-serif; margin: 20px; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px; background-color: #f9f9f9;">
          <h2 style="color: #333;">New Contact Message from BlogLog</h2>
          <p><strong style="color: #555;">Name:</strong> ${name}</p>
          <p><strong style="color: #555;">Email:</strong> ${email}</p>
          <p><strong style="color: #555;">Message:</strong></p>
          <p style="background-color: #fff; border-left: 4px solid #007BFF; padding: 10px; color: #333;">${message}</p>
          <br>
          <p style="color: #777;">Thank you,<br>BlogLog Team</p>
        </div>
      `,
    }
    await transporter.sendMail(mailOptions);

    // Render the contact page with a success message
    res.render('contact', {
      currentRoute: '/contact',
      message: 'Thank you for reaching out! We will get back to you soon.',
    });
  } catch (error) {
    console.error(error);
    res.render('contact', {
      currentRoute: '/contact',
      message: 'There was an error sending your message. Please try again later.',
    });
  }
});


/* Authentication */

router.get('/login', async (req, res) => {
  try {
    const locals = {
      title: 'Login',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    };

    res.render('login', { locals, currentRoute: '/login' });
  } catch (error) {
    console.log(error);
  }
});

router.post('/login', async (req, res, next) => {
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

      const data = {
        id: user._id,
        username: user.username,
        admin: process.env.ADMIN_USERNAME.split(",").some(x => x === user.username),
      }

      const token = jwt.sign(data, jwtSecret, { expiresIn: '1h' });
      res.cookie('user', Object.assign(data, { token }))

      return res.redirect('/');
    });
  })(req, res, next);
});


router.get('/register', (req, res) => {
  // Initialize messages object, you can adjust it according to your error handling logic
  const locals = {
    title: 'Admin',
    description: 'Simple Blog created with NodeJs, Express & MongoDb.',
  };

  res.render('register', { locals, currentRoute: '/register' });
});



router.post('/register', validateRegistration, async (req, res) => {
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

      const data = {
        id: user._id,
        username: user.username,
        admin: process.env.ADMIN_USERNAME.split(",").some(x => x === user.username),
      }

      const token = jwt.sign(data, jwtSecret, { expiresIn: '1h' });
      res.cookie('user', Object.assign(data, { token }), { httpOnly: true });

      return res.redirect('/');
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
    res.clearCookie('user');
    res.redirect('/');
  });
});

// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Understanding the Basics of HTML and CSS",
//       body: "HTML (HyperText Markup Language) and CSS (Cascading Style Sheets) are the fundamental technologies for building web pages. HTML provides the structure of the page, while CSS is used to control the presentation, formatting, and layout. This blog post will guide you through the essential concepts and elements of HTML and CSS, providing examples and best practices for creating well-structured and visually appealing web pages.",
//       author: "Rishabh"
//     },
//     {
//       title: "An Introduction to JavaScript for Beginners",
//       body: "JavaScript is a versatile programming language that allows you to create dynamic and interactive web content. This post will cover the basics of JavaScript, including variables, data types, functions, and control structures. You'll learn how to add interactivity to your web pages and understand how JavaScript interacts with HTML and CSS to enhance user experiences.",
//       author: "Rishabh"
//     },
//     {
//       title: "Building Responsive Web Designs with CSS Grid and Flexbox",
//       body: "Responsive web design ensures that your website looks great on all devices, from desktops to mobile phones. CSS Grid and Flexbox are powerful layout modules that help you create flexible and responsive designs. In this blog, we'll explore the concepts and practical implementations of CSS Grid and Flexbox, with code examples and tips for creating responsive layouts.",
//       author: "Rishabh"
//     },
//     {
//       title: "Getting Started with React: A JavaScript Library for Building User Interfaces",
//       body: "React is a popular JavaScript library developed by Facebook for building user interfaces. It allows developers to create large web applications that can update and render efficiently in response to data changes. This post will introduce you to the core concepts of React, including components, JSX, state, and props, and guide you through setting up a basic React application.",
//       author: "Rishabh"
//     },
//     {
//       title: "Understanding RESTful APIs and How to Integrate Them into Your Web Applications",
//       body: "RESTful APIs (Application Programming Interfaces) are a set of rules and conventions for building and interacting with web services. They allow different software systems to communicate with each other. This blog post will explain what RESTful APIs are, how they work, and how to integrate them into your web applications using JavaScript and AJAX.",
//       author: "Rishabh"
//     },
//     {
//       title: "A Guide to Modern JavaScript Frameworks: Angular, Vue, and Svelte",
//       body: "Modern JavaScript frameworks like Angular, Vue, and Svelte have revolutionized web development by providing robust tools for building complex applications. This post will compare these three frameworks, discussing their unique features, strengths, and use cases. By the end of this guide, you'll have a better understanding of which framework might be the best fit for your next project.",
//       author: "Rishabh"
//     },
//     {
//       title: "Enhancing Web Performance with Lazy Loading and Code Splitting",
//       body: "Web performance is crucial for user experience and SEO. Lazy loading and code splitting are techniques that can significantly improve the load times of your web pages. This blog will explain how lazy loading defers the loading of non-critical resources and how code splitting breaks down your code into smaller bundles. Examples and implementation strategies will be provided to help you optimize your web performance.",
//       author: "Rishabh"
//     },
//     {
//       title: "Mastering Git and GitHub for Version Control",
//       body: "Git is a distributed version control system that helps developers track changes in their code. GitHub is a platform for hosting Git repositories. This post will cover the basics of Git and GitHub, including how to create repositories, commit changes, branch, merge, and collaborate with others. Understanding these tools is essential for modern web development and team collaboration.",
//       author: "Rishabh"
//     },
//     {
//       title: "Implementing Authentication in Web Applications with JWT",
//       body: "JSON Web Tokens (JWT) are a compact and secure way to transmit information between parties as a JSON object. They are commonly used for authentication and authorization in web applications. This blog post will guide you through the process of implementing JWT authentication in a web application, including generating tokens, securing endpoints, and managing user sessions.",
//       author: "Rishabh"
//     },
//     {
//       title: "Exploring the Power of CSS Preprocessors: Sass and LESS",
//       body: "CSS preprocessors like Sass and LESS extend the capabilities of standard CSS by adding features like variables, nesting, and mixins. This post will introduce you to Sass and LESS, showing you how to install and use them to write more efficient and maintainable CSS code. Examples and practical tips will help you get started with these powerful tools.",
//       author: "Rishabh"
//     }
//   ])
// }

// // Call the function to insert 10 posts
// insertPostData();


module.exports = router;
