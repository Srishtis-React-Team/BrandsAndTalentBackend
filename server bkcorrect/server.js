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
 



  socket.on("addNewUser",(userId)=>{
   //console.log("addNewUser",userId)
    !onlineUsers.some(user=>user.userId===userId)&&
    onlineUsers.push({
      userId,
      socketId:socket.id,
    });

   
    io.emit("getOnlineUsers",onlineUsers)
     console.log("onlineUsers get",onlineUsers)

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

  // socket.on("sendMessage",(message)=>{
  //   const user=onlineUsers.find(
  //   (user)=user.userId ===message.recipientId
  //   );
  //   if(user){
  //     io.to(user.socketId).emit("getMessage",message);
  //     io.to(user.socketId).emit("getNotification",{

  //       senderId:message.senderId,
  //       isRead:false,
  //       date:new Date(),

  //     });

    
  //   }
  // })
  socket.on("disconnect",()=>{
    onlineUsers=onlineUsers.filter((user)=>user.socketId!==socket.id);
    io.emit("getOnlineUsers",onlineUsers)

  
  })
   
 });
       


const adultmodel = require('./users/models/adultmodel.js');




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


// let userss = [];

// const addUser = (userId, socketId) => {
//   console.log(`Attempting to add user: ${userId} with socketId: ${socketId}`);
//   if (!userss.some(user => user.userId === userId)) {
//       userss.push({ userId, socketId });
//       console.log('User added:', userId, socketId);
      
//   } else {
//       console.log('User already exists, not adding:', userId);
//   }
//   console.log('Current users:', userss);
// };

// const removeUser = (socketId) => {
//     console.log('Attempting to remove user with socketId:', socketId);
//     const beforeCount = userss.length;
//     userss = userss.filter(user => user.socketId !== socketId);
//     const afterCount = userss.length;
//     console.log(`User removed: ${beforeCount} -> ${afterCount}`, userss);
// };
// const getUser = (userId) => {
//   console.log("userssget user",userss)
//   console.log("userId",userId)
//   console.log('User found:', userss.find((user) => user.userId === userId));
//   const user = userss.find((user) => user.userId === userId); // Find the user
//   console.log('User found:for test', user); // Log the result of the find operation

//   return user;
//   //return userss.find((user) => user.userId === userId);
// };

// io.on("connection", (socket) => {
//     //when connect
//     console.log("a user connected.");
//     console.log('users in connection',userss)
//     //take userId and socketId from user
//     socket.on("addUser", (userId) => {
//         addUser(userId, socket.id);
       
//         console.log('user details', userId)
//         console.log('socket details', socket.id)
//         io.emit("getUsers", userss);
//         console.log("uerssssss",userss)
//     });

//     //send and get message
//     socket.on("sendMessage", ({ senderId,receiverId, text }) => {// conversationId
//       //if(conversationId){
//         const user = getUser(receiverId)// conversationId
//         console.log('fetched user details', user)
//      // }
      
//        // const user = getUser(conversationId);
//       //  console.log('users in message',userss)
//         //console.log('fetched user details', user)
//         console.log('message from user',text)
//         console.log("conversationId",receiverId)//// conversationId
//         console.log("senderId",senderId)
        
//         if(user){
//           console.log("user.socketId",user.socketId)
//         io.to(user.socketId).emit("getMessage", {
          
//          // receiverId,//// conversationId
//          // userss,
//             senderId,
//             text,
//         });
      


//     }
//     });

//     //when disconnect
//     socket.on("disconnect", () => {
//         console.log('users in disconnection',userss)
//         console.log("a user disconnected!",socket.id);
//         removeUser(socket.id);
//         io.emit("getUsers", userss);
       
//     });
    
// });
// httpServer.listen(4014, () => console.log(`Server running on port 4014`));
// module.exports = io;
//io.listen(4014);
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
