require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const rfs = require("rotating-file-stream");
const passport = require('passport'); // Added passport for authentication
const flash = require('connect-flash'); // Added flash for storing flash messages

const connectDB = require("./server/config/db");
const { isActiveRoute } = require("./server/helpers/routeHelpers");
const morgan = require("morgan");

// Passport configuration
require('./server/config/passport')(passport); // Passport config to be created separately

const app = express();
const PORT = process.env.PORT || 5000;

const accessLogStream = rfs.createStream("application.log", {
  interval: "1d",
  path: "./logs",
});

app.use(morgan("combined", { stream: accessLogStream }));

// Connect to DB

app.use(session({
    secret: 'your_secret_key', // Change this to your secret key
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());


// Connect to MongoDB
connectDB();

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(methodOverride("_method"));

// Session setup for storing user session data
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat", // Use SESSION_SECRET from .env
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // Use MongoDB Atlas URI from .env
    }),
    // cookie: { maxAge: new Date(Date.now() + 3600000) }// Uncomment if you want custom cookie expiry time
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session()); // Persist user sessions

// app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // Error messages from Passport
  next();
});

// Static files
app.use(express.static("public"));

// Templating Engine
app.use(expressLayout);
app.set('view engine', 'ejs');

// Helper for active route
app.locals.isActiveRoute = isActiveRoute; 

// Routes

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.use((req, res, next) => {
  res.status(404).render('404',{ layout: false }); // Renders the 404.ejs file
});

// Start the server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
