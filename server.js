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
//user auth globally decalre
// const authenticateToken = require('./middleware/authmiddleware.js');
// require('dotenv').config();

// // Apply authentication middleware globally
// app.use(authenticateToken);

//user auth globally decalre



let onlineUsers =[];


 io.on("connection", (socket) => {
  console.log("new connection",socket.id);
  //listen to connection
 

  socket.on("addNewUser", async (userId) => {
    console.log("addNewUser", userId);
  
    // Check if the user is not already in the onlineUsers array
    if (!onlineUsers.some(user => user.userId === userId)) {  //!onlineUsers                        
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });
 
  
      // Update isOnline status in the database

    // Update isOnline status in the database
   // Update isOnline status in the database for all users in onlineUsers array
   try {
    // Prepare promises to update the isOnline status for each user in the onlineUsers array
    const updatePromises = onlineUsers.map(async (user) => {
      const userId = user.userId;
      return Promise.all([
        adultmodel.findOneAndUpdate({ _id: userId }, { $set: { isOnline: true } }, { new: true }).exec(),
        brandsmodel.findOneAndUpdate({ _id: userId }, { $set: { isOnline: true } }, { new: true }).exec(),
        kidsmodel.findOneAndUpdate({ _id: userId }, { $set: { isOnline: true } }, { new: true }).exec()
      ]);
    });

    // Await all the updates
    await Promise.all(updatePromises);
    console.log("updatePromises",updatePromises)

    console.log(`All users in the onlineUsers array are set to online in the relevant models.`);
  } catch (error) {
    console.error("Error setting users to online:", error);
  }
}
  
   

     // Emit the updated list of online users
     io.emit("getOnlineUsers", onlineUsers);
     console.log("onlineUsers get", onlineUsers);
 
  });
  



  socket.on("createChat", async (firstId,secondId,socketId) => {
    console.log("chat one",firstId)
    console.log("chat second",secondId)
    console.log("socketId",socketId)
    const chat = await chatmodel.findOne({
      members: { $all: [firstId, secondId]},// Ensure consistent order
  });
  console.log("chta",chat)
  
  if (chat) {
    console.log("message testtttt",firstId)
    console.log("message testtttt",secondId)
      io.to(chat.socketId).emit("chatCreated",firstId,secondId,socketId );
      console.log("chat.socketId",chat.socketId)
      
  } 
  
});
    

  socket.on("sendMessage", (message) => {
    
    console.log("onlineUsers testttt",onlineUsers)
    
    console.log("message.recipientId",message)
    const user = onlineUsers.find(user => user.userId === message.recipientId);
   // console.log("user.userId ",user.userId )
  
  
   console.log("uesr test",user)
    console.log("message",message)
    
    
    io.to(user.socketId).emit("getMessage", message);
        //console.log("message getttt",message)

        io.to(user.socketId).emit("getNotification", {
            senderId: message.senderId,
            isRead: false,
            date: new Date(),
        });
});



  
  // })
  socket.on("disconnect", async () => {
    // Remove the user from the online users list
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);

    try {
      // Assume userId is available in the socket context, e.g., socket.userId
      const userId = socket.userId;
  
      // Check if the user is still in the online users list
      const userStillOnline = onlineUsers.some(user => user.userId === userId);
  
      if (!userStillOnline) {
        // Update the user in each of the models
        await Promise.all([
          adultmodel.updateOne({ _id: userId }, { $set: { isOnline: false } }),
          brandsmodel.updateOne({ _id: userId }, { $set: { isOnline: false } }),
          kidsmodel.updateOne({ _id: userId }, { $set: { isOnline: false } })
        ]);
  
        console.log(`User ${userId} set to offline in all models.`);
      }
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
const content = require('./admin/routes/contentroutes.js');
const blog = require('./admin/routes/blogroutes.js');

//brands
const brands = require('./brands/routes/brandroutes');
const gigs = require('./brands/routes/gigsroutes');
const reviews = require('./brands/routes/reviewroutes');
const notification = require('./brands/routes/notification.js');
const conversation = require('./brands/routes/conversationroutes.js');
const message = require('./brands/routes/messageroutes.js');
const chat = require('./brands/routes/chatroutes.js');



// Define routes

app.use('/api/users',users);
app.use('/api/admin',admin);
app.use('/api/brands',brands);
app.use('/api/pricing',pricing);
app.use('/api/profession',profession);
app.use('/api/features',features);
app.use('/api/gigs',gigs);
app.use('/api/reviews',reviews);
app.use('/api/keyword',keyword);
app.use('/api/notification',notification);
app.use('/api/conversation',conversation);
app.use('/api/message',message);
app.use('/api/chat',chat);
app.use('/api/content',content);
app.use('/api/blog',blog);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/upload1', express.static(path.join(__dirname, 'upload1')));


app.use(express.json()); // Middleware to parse JSON bodies



// Start HTTP server on port 4014
httpServer.listen(4015, () => {
  console.log("Server is listening on port 4015");
});



