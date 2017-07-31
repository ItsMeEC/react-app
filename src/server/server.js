require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const qs = require('querystring');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const dist = path.join(__dirname, '../../dist');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../dist')));

// =========================================================================
// CONNECT TO MONGO

mongoose.connect(process.env.MONGO_URI, (err) => {
  if (err) {
    console.log(`DB CONNECT FAILED: ${err}`);
  } else {
    console.log(`DB CONNECT SUCCESS: ${process.env.MONGO_URI}`);
  }
});

// =========================================================================
// GET YELP TOKEN

const config = qs.stringify({
  grant_type: 'client_credentials',
  client_id: process.env.YELP_APP_ID,
  client_secret: process.env.YELP_APP_SECRET,
});

let yelpToken = '';

axios.post('https://api.yelp.com/oauth2/token', config).then((res) => {
  yelpToken = res.data.access_token;
}).catch((err) => {
  console.log(err);
});

// =========================================================================
// PASSPORT

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('./models/User');
const session = require('express-session');

const MongoStore = require('connect-mongo')(session);

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.APP_URL}/auth/google/callback`,
},
  (token, refreshToken, profile, done) => {
    process.nextTick(() => {
      User.findOne({ googleId: profile.id }, (findErr, user) => {
        if (findErr) { return done(findErr); }

        if (user) {
          return done(null, user);
        }
        const newUser = new User();

        newUser.googleId = profile.id;
        newUser.name = profile.displayName;

        newUser.save((saveErr) => {
          if (saveErr) { throw saveErr; }
        });
        return done(null, newUser);
      });
    });
  }));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  });

// =========================================================================
// ROUTES

const api = require('./routes/api');

app.use('/api', api);

const Bar = require('./models/Bar');

app.get('/getbars/:location', (req, res) => {
  axios({
    method: 'get',
    url: `https://api.yelp.com/v3/businesses/search?categories=bars&location=${req.params.location}`,
    headers: { Authorization: (`Bearer ${yelpToken}`) },
  })
  .then((results) => {
    res.send(results.data.businesses);
  })
  .catch((err) => {
    console.log(err);
  });
});

app.post('/addGoing/:id', (req, res) => {
  Bar.findOne({ id: req.params.id }, (err, result) => {
    if (err) throw err;

    if (result) {
      const bar = result;
      bar.going = req.body;
      Bar.findByIdAndUpdate({ _id: result._id }, bar, { new: true }, (findErr, updatedBar) => {
        res.send(updatedBar);
      });
    } else {
      Bar.create({
        id: req.params.id,
        going: req.body,
        date: new Date(),
      }, (createErr, updatedBar) => {
        res.send(updatedBar);
      });
    }
  });
});

app.get('/authcheck', (req, res) => {
  res.send(req.user);
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

// =========================================================================
// START SERVER

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Node.js listening on port ${port}`);
});
