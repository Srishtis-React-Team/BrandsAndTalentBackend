const mongoose = require("mongoose")
const express = require('express')
const app =express()
const connectToDatabase = require('./connection/config');
var path = require('path');
const cors = require('cors');
const crypto = require('crypto');//otp
const passport=require("passport"); //google
const auth=require("./auth"); //google
const session=require('express-session');
const bodyParser = require('body-parser');
const FacebookStrategy = require('passport-facebook').Strategy;//21/3
const router = express.Router();  //21/3
const kidsmodel = require('./users/models/kidsmodel.js');


function isLoggedIn(req,res,next){
  req.user?next():res.sendStatus(401);
}

app.use(express.json());
// Enable CORS for all routes
app.use(cors());

app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email','profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    successRedirect:'/auth/google/success',
    failureRedirect: '/auth/google/failure' ,// /login
  // function(req, res) {
  //   // Successful authentication, redirect home.
  //   res.redirect('/');
  // });
  }));
  app.get('/auth/google/failure', (req,res)=>{
    res.send("Something went wrong");
  
  });
  
  app.get('/auth/protected', isLoggedIn, (req, res) => {
    let name = req.user.displayName; // Use let to declare name
    res.send(`Hello ${name}`);
  });

  //new
// Increase the payload limit if dealing with large JSON bodies
app.use(bodyParser.json({ limit: '50mb' }));

// Error handling for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON');
    return res.status(400).send({ status: 'error', message: 'Bad JSON' }); // Bad JSON
  }
  next();
});


//facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'emails', 'birthday'], // Note: 'emails' is plural
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        // Extract email and birthday from the profile
        const email = profile.emails && profile.emails[0].value; // Email is an array
        const birthday = profile._json.birthday; // Access birthday directly from the JSON

        // Find user in database
     let user = await kidsmodel.findOne({ facebookId: profile.id });
       // let user = await kidsmodel.findOne({ accountId: profile.id, provider: 'facebook' });

        if (!user) {
          console.log('No existing user found. Adding new facebook user to DB..');
          // Create new user
          const newUser = new kidsmodel({
            facebookId: profile.id,
            name: profile.displayName,
            provider: profile.provider,
            parentEmail: email, // Save the email
            birthday: birthday, // Save the birthday
          });

          await newUser.save();
          console.log('New user saved:', newUser);
        } else {
          console.log('Facebook User already exists in DB. Updating details if necessary..');
          // This block assumes you want to update the user's email and birthday if it changes.
          let shouldUpdate = false;
          if (user.parentEmail !== email) {
            user.parentEmail = email;
            shouldUpdate = true;
          }
          if (user.birthday !== birthday) {
            user.birthday = birthday;
            shouldUpdate = true;
          }
          if (shouldUpdate) {
            await user.save();
            console.log('User updated:', user);
          } else {
            console.log('No updates necessary for the user.');
          }
        }

        // Pass user profile to callback function
        cb(null, profile);
      } catch (err) {
        console.error('Error processing Facebook authentication:', err);
        cb(err, null);
      }
    }
  )
);

router.get('/', passport.authenticate('facebook', { scope: ['email', 'user_birthday'] }));

router.get(
  '/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/facebook/error',
    successRedirect: '/auth/facebook/success',
  })
);

router.get('/success', async (req, res) => {
  const userInfo = {
    id: req.session.passport.user.id,
    displayName: req.session.passport.user.displayName,
    provider: req.session.passport.user.provider,
  };
  res.render('fb-github-success', { user: userInfo });
});

router.get('/error', (req, res) => res.send('Error logging in via Facebook..'));

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('session destroyed.');
    });
    res.render('auth');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out fb user' });
  }
});




//correct

  
// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: "http://localhost:4014/auth/facebook/callback",
//   profileFields: ['id', 'displayName', 'photos', 'email', 'birthday'] // Requesting email and birthday
// },

// async function(accessToken, refreshToken, profile, done) {
//   try {
//     // Access the email and birthday from the profile object
//     const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
//     const birthday = profile._json.birthday ? new Date(profile._json.birthday) : null; // Assuming birthday is returned in a standard format

//     let user = await kidsmodel.findOne({ facebookId: profile.id });
//     console.log("profile",profile)

//     if (!user) {
//       // Create a new user if not found
//       user = new kidsmodel({
//         facebookId: profile.id,
//         name: profile.displayName,
//         photoURL: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
//         provider: 'facebook',
//         parentEmail: email, // Assign the email to parentEmail
//         birthday: birthday // Save the birthday
//       });

//       await user.save();
//     }
    
//     return done(null, user);
//   } catch (err) {
//     console.error(err);
//     return done(err);
//   }
// }));


// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: "http://localhost:4014/auth/facebook/callback",
//   profileFields: ['id', 'displayName', 'photos', 'email'] // Specify the fields you want to access
// },
// async function(accessToken, refreshToken, profile, done) {
//   try {
//     let user = await kidsmodel.findOne({ facebookId: profile.id });

//     if (!user) {
//       // If the user doesn't exist, create a new one
//       user = new kidsmodel({
//         facebookId: profile.id,
//         name: profile.displayName,
//         photoURL: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
//         provider: 'facebook', // Assuming the provider is Facebook
//         parentEmail: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null
//       });

//       await user.save();
//     }
    
//     return done(null, user);
//   } catch (err) {
//     console.error(err);
//     return done(err);
//   }
// }
// ));




passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
kidsmodel.findById(id, (err, user) => done(err, user));
});

// Middleware
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
passport.authenticate('facebook', { failureRedirect: '/login' }),
(req, res) => {
  // Successful authentication, redirect home.
  res.redirect('/');
}
);

app.get('/', (req, res) => res.send('Home Page - Authentication Successful'));
app.get('/login', (req, res) => res.send('Login Page'));




//facebook
  


//user panel
const users = require('./users/routes/kidsroutes');

//admin panel
const admin = require('./admin/routes/adminroutes');
const pricing = require('./admin/routes/pricingroutes');
const profession = require('./admin/routes/professionroutes');
const features = require('./admin/routes/featuresroutes');
const keyword = require('./admin/routes/keywordroutes.js');

//brands
const brands = require('./brands/routes/brandroutes');
const gigs = require('./brands/routes/gigsroutes');
const reviews = require('./brands/routes/reviewroutes');

// Define routes
app.use('/brandsntalent_api/users',users);
app.use('/brandsntalent_api/admin',admin);
app.use('/brandsntalent_api/brands',brands);
app.use('/brandsntalent_api/pricing',pricing);
app.use('/brandsntalent_api/profession',profession);
app.use('/brandsntalent_api/features',features);
app.use('/brandsntalent_api/gigs',gigs);
app.use('/brandsntalent_api/reviews',reviews);
app.use('/brandsntalent_api/keyword',keyword);



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/upload1', express.static(path.join(__dirname, 'upload1')));

//google sign up
//app.use(express.static(path.join(__dirname, 'client')));


     
try {
   
    // Start the server
    app.listen(4014, () => {
      console.log('Server is listening on port 4014');
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
  module.exports = router;//21/3

  