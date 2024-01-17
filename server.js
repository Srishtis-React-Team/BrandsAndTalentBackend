const mongoose = require("mongoose")
const express = require('express')
const app =express()
const connectToDatabase = require('./connection/config');
var path = require('path');


app.use(express.json());


//user panel
const users = require('./users/routes/userroutes');

//admin panel
const admin = require('./admin/routes/adminroutes');

// Define routes
app.use('/brandsntalent_api/users',users);
app.use('/brandsntalent_api/admin',admin);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
     
try {
   
    // Start the server
    app.listen(4014, () => {
      console.log('Server is listening on port 4014');
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
  