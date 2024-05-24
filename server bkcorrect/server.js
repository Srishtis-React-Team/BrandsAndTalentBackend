const mongoose = require("mongoose")
const express = require('express')
const app =express()
const connectToDatabase = require('./connection/config');
var path = require('path');
const cors = require('cors');
const crypto = require('crypto');//otp
const bodyParser = require('body-parser');
//26/3
const passport=require("passport"); //google
const auth=require("./auth"); //google
const session=require('express-session');
const { createServer } = require('http');
const { Server } = require('socket.io');
const chatmodel = require("./brands/models/chatmodel.js");

const adultmodel = require('./users/models/adultmodel.js');
const kidsmodel = require('./users/models/kidsmodel.js');
const brandsmodel = require("./brands/models/brandsmodel.js");

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
          adultmodel.updateOne({ _id: userId }, { $set: { isOnline: true } }),
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

 
  // socket.on("disconnect",()=>{
  //   onlineUsers=onlineUsers.filter((user)=>user.socketId!==socket.id);
  //   io.emit("getOnlineUsers",onlineUsers)

  
  // })
  socket.on("disconnect", async () => {
    // Remove the user from the online users list
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  
    try {
      // Assume userId is available in the socket context, e.g., socket.userId
      const userId = socket.userId;
  
      // Update the user in each of the models
      await Promise.all([
        adultmodel.updateOne({ _id: userId }, { $set: { isOnline: false } }),
        brandsmodel.updateOne({ _id: userId }, { $set: { isOnline: false } }),
        kidsmodel.updateOne({ _id: userId }, { $set: { isOnline: false } })
      ]);
  
      console.log(`User ${userId} set to offline in all models.`);
    } catch (error) {
      console.error("Error setting user to offline:", error);
    }
  });
  
 });
       

app.use(cors());



function isLoggedIn(req,res,next){
  req.user?next():res.sendStatus(401);
}

app.use(express.json());



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
const chat = require('./brands/routes/chatroutes.js');


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
app.use('/brandsntalent_api/chat',chat);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/upload1', express.static(path.join(__dirname, 'upload1')));


app.use(express.json()); // Middleware to parse JSON bodies

    

// Start HTTP server on port 4014
httpServer.listen(4014, () => {
  console.log("Server is listening on port 4014");
});


// try {
   
//     // Start the server
//     app.listen(4014, () => {
//       console.log('Server is listening on port 4014');
//     });
//   } catch (error) {
//     console.error('Error connecting to database:', error);
//   }


// Server Listening
// const port = process.env.PORT || 4014;
// server.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

// module.exports = io;
