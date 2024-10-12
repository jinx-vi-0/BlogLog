const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        async (username, password, done) => {
          try {
            const user = await User.findOne({ username });
            if (!user) return done(null, false, { message: 'Incorrect username.' });
      
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
      
            return done(null, user); // User found and password matches
          } catch (error) {
            return done(error);
          }
        }
      ));
      

  // Serializing user to store user details in session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserializing user to retrieve user details from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  });
};
