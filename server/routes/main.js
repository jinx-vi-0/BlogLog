const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

/**
 * GET /
 * HOME
*/
router.get('', async (req, res) => {
  try {
    const locals = {
      title: "BlogLog",
      description: "Made with ❤️"
    }

    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    // Count is deprecated - please use countDocuments
    // const count = await Post.count();
    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', { 
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/'
    });

  } catch (error) {
    console.log(error);
  }

});

// router.get('', async (req, res) => {
//   const locals = {
//     title: "NodeJs Blog",
//     description: "Simple Blog created with NodeJs, Express & MongoDb."
//   }

//   try {
//     const data = await Post.find();
//     res.render('index', { locals, data });
//   } catch (error) {
//     console.log(error);
//   }

// });


/**
 * GET /
 * Post :id
*/
router.get('/post/:id', async (req, res) => {
  try {
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });

    const locals = {
      title: data.title,
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
 * POST /
 * Post - searchTerm
*/
router.post('/search', async (req, res) => {
  try {
    const locals = {
      title: "Seach",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
        { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
      ]
    });

    res.render("search", {
      data,
      locals,
      currentRoute: '/'
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
    currentRoute: '/about'
  });
});


// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Advanced Techniques in React Development",
//       body: "Explore advanced techniques such as state management with Redux, performance optimization, and server-side rendering in React applications."
//     },
//     {
//       title: "Building Scalable Web Applications with Python Flask",
//       body: "Learn how to architect and deploy scalable web applications using the Python Flask framework, including best practices for database management and RESTful API design."
//     },
//     {
//       title: "Introduction to Machine Learning with Python",
//       body: "Get started with machine learning using Python and popular libraries like scikit-learn and TensorFlow. Learn about supervised and unsupervised learning algorithms."
//     },
//     {
//       title: "Responsive Web Design Principles",
//       body: "Understand the principles of responsive web design, including flexible grids, media queries, and fluid layouts, to create websites that adapt to various screen sizes and devices."
//     },
//     {
//       title: "Securing Web Applications with JWT Authentication",
//       body: "Learn how to implement JSON Web Token (JWT) authentication to secure your web applications, including user authentication, token generation, and validation."
//     },
//     {
//       title: "Exploring Data Visualization with D3.js",
//       body: "Dive into data visualization techniques using D3.js, a powerful JavaScript library. Create interactive and dynamic visualizations to present data in a meaningful way."
//     },
//     {
//       title: "Optimizing Frontend Performance with Webpack",
//       body: "Discover how to optimize frontend performance using Webpack, a module bundler for JavaScript applications. Learn about code splitting, lazy loading, and tree shaking."
//     },
//     {
//       title: "GraphQL Fundamentals: Building APIs with GraphQL",
//       body: "Learn the fundamentals of GraphQL and how to build APIs using GraphQL schemas, queries, mutations, and subscriptions. Compare GraphQL with RESTful APIs."
//     },
//     {
//       title: "Exploring DevOps Practices for Continuous Integration and Deployment",
//       body: "Explore DevOps practices such as continuous integration (CI) and continuous deployment (CD) to automate software delivery pipelines and improve collaboration between development and operations teams."
//     },
//     {
//       title: "Introduction to Docker Containers and Container Orchestration",
//       body: "Get an introduction to Docker containers and container orchestration tools like Kubernetes. Learn how to containerize applications for easier deployment and management."
//     }
//   ]);
// }

// Call the function to insert 10 posts
// insertPostData();


module.exports = router;
