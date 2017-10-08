const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const UserModel = require('../models/user-model');

//serialize user
passport.serializeUser((userFromDb, done) => {
  done(null, userFromDb._id);
});

//deserializeUser
passport.deserializeUser((idFromSession, done) => {
  UserModel.findById(
    idFromSession,
    (err, userFromDb) => {
      if (err) {
        done(err);
        return;
      }
      done(null, userFromDb);
    }
  )
});

//LocalStrategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'loginUsername',
      passwordField: 'loginPassword'
    },
    (sentUsername, sentPassword, done) => {
      UserModel.findOne(
        { username: sentUsername },
        (err, userFromDb) => {
          if (err) {
            done(err);
            return;
          }
          if(!userFromDb) {
            done(null, false, { message: 'Bad username 😡'});
            return;
          }
          const isPasswordGood =
            bcrypt.compareSync(sentPassword, userFromDb.encryptedPassword);
          if (!isPasswordGood) {
            done(null, false, { message: 'Bad Password 👻'});
            return;
          }
          done(null, userFromDb);
        }
      );
    }
  )
);
