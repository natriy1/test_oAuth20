const express = require('express');
const app = express();
const port = 8081;
const path = require('path');
const session = require('express-session');

const passport = require('passport');
const YandexStrategy = require('passport-yandex').Strategy;
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

app.use(session({ secret: "supersecret", resave: true, saveUninitialized: true }));

let Users = [{'login': 'admin', 'email':'natriy1@yandex.ru'},
            {'login': 'user', 'email':'natriy1@gmail.com'}];

const findUserByLogin = (login) => {
    return Users.find((element)=> {
        return element.login == login;
    })
}

const findUserByEmail = (email) => {
    return Users.find((element)=> {
        return element.email.toLowerCase() == email.toLowerCase();
    })
}

app.use(passport.initialize());
app.use(passport.session());


//passport.serializeUser((user, done) => {
  //  done(null, user.login);
//  });
  //user - объект, который Passport создает в req.user
//passport.deserializeUser((login, done) => {
//    user = findUserByLogin(login);
//        done(null, user);
//});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new YandexStrategy({
    clientID: 'c83b31ba2eb24b1eb552ac832c5e6b17',
    clientSecret: 'c1a1fd0a12614005bd7267641d0484da',
    callbackURL: "http://localhost:8081/auth/yandex/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    let user = findUserByEmail(profile.emails[0].value);
    user.profile = profile;
    if (user) return done(null, user);

    done(true, null);
  }
));

passport.use(new GoogleStrategy({
    clientID:     '695525274642-48eakocvrdt5j5benr38f9gsr02bfa4f.apps.googleusercontent.com',
    clientSecret: 'U142Uww6eQyFyX4Z2RCK2cKd',
    callbackURL: "http://localhost:8081/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    if (profile) {
		user = profile;
		return done(null, user);
	}
	else {
		return done(null, false);
		};
    }
));

const isAuth = (req, res, next)=> {
    if (req.isAuthenticated()) return next();

    res.redirect('/sorry');
}


app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, 'main.html'));
});
app.get('/sorry', (req, res)=> {
    res.sendFile(path.join(__dirname, 'sorry.html'));
});
app.get('/auth/yandex', passport.authenticate('yandex'));

app.get('/auth/yandex/callback', passport.authenticate('yandex', { failureRedirect: '/sorry', successRedirect: '/private' }));

app.get('/private', isAuth, (req, res)=>{
    res.send(req.user);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: 
      [ 'https://www.googleapis.com/auth/plus.login',
      , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));

app.get( '/auth/google/callback', 
    passport.authenticate( 'google', { 
        successRedirect: '/private',
        failureRedirect: '/auth/google/failure'
}));


app.listen(port, () => console.log(`App listening on port ${port}!`))