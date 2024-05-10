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
const { createServer } = require('http');
const { Server } = require('socket.io');

const chatmodel = require("./brands/models/chatmodel.js");
const brandsmodel = require("./brands/models/brandsmodel.js");
//const io = new Server({cors: "http://localhost:3000"});
//const httpServer = createServer(app);
// const io = new Server(httpServer, {
//     cors: {
//         origin: "*",


//     }
// })
const httpServer = createServer(app); // Create the HTTP server from the Express app
const io = new Server(httpServer, {
  cors: "http://13.234.177.61:3000"
});

let onlineUsers =[];


 io.on("connection", (socket) => {
  console.log("new connection",socket.id);
  //listen to connection
 


  socket.on("addNewUser", async (userId) => {
    console.log("addNewUser", userId);
  
    // Check if the user is not already in the onlineUsers array
    if (!onlineUsers.some(user => user.userId === userId)) {
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });

  
      // Emit the updated list of online users
      io.emit("getOnlineUsers", onlineUsers);
      console.log("onlineUsers get", onlineUsers);
        
      // Update isOnline status in the database
      try {
        // Update the user in each of the models
        await Promise.all([
          adultmodel.updateMa({ _id: userId }, { $set: { isOnline: true } }),
          brandsmodel.updateOne({ _id: userId }, { $set: { isOnline: true } }),
          kidsmodel.updateOne({ _id: userId }, { $set: { isOnline: true } })
        ]);
  
        console.log(`User ${userId} set to online in all models.`);
      } catch (error) {
        console.error("Error setting user to online:", error);
      }
    }
  });
  socket.on("createChat", async (firstId,secondId) => {
  
    const chat = await chatmodel.findOne({
      members: { $all: [firstId, secondId]} // Ensure consistent order
  });

  if (chat) {
    console.log("message testtttt",firstId)
    console.log("message testtttt",secondId)
      io.to(chat.socketId).emit("chatCreated",firstId,secondId );
      console.log("message getttt",firstId)
  } 
});
socket.on("sendMessage", (message) => {
    
  console.log("onlineUsers testttt",onlineUsers)
  //console.log("message testststt",message)
  const user = onlineUsers.find(user => user.userId === message.recipientId);

 //console.log("uesr test",user)
  console.log("message",message)
  if (user) {
    console.log("message testtttt",message)
      io.to(user.socketId).emit("getMessage", message);
      console.log("message getttt",message)

      io.to(user.socketId).emit("getNotification", {
          senderId: message.senderId,
          isRead: false,
          date: new Date(),
      });
  }
});


socket.on("disconnect",()=>{
  onlineUsers=onlineUsers.filter((user)=>user.socketId!==socket.id);
  io.emit("getOnlineUsers",onlineUsers)


})
 
});
     
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

//

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
const notification = require('./brands/routes/notification.js');
const conversation = require('./brands/routes/conversationroutes.js');
const message = require('./brands/routes/messageroutes.js');

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
app.use('/brandsntalent_api/notification',notification);
app.use('/brandsntalent_api/conversation',conversation);
app.use('/brandsntalent_api/message',message);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/upload1', express.static(path.join(__dirname, 'upload1')));


app.use(express.json()); // Middleware to parse JSON bodies



httpServer.listen(4014, () => {
  console.log("Server is listening on port 4014");
});

  