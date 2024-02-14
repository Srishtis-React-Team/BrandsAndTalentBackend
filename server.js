const mongoose = require("mongoose")
const express = require('express')
const app =express()
const connectToDatabase = require('./connection/config');
var path = require('path');
const cors = require('cors');
const session = require('express-session');//otp
const crypto = require('crypto');//otp

app.use(express.json());
// Enable CORS for all routes
app.use(cors());
//otp
app.use(session({
  secret: 'brandsandtalent', // Replace with your own secret key
  resave: false,
  saveUninitialized: true
}));
  //otp


//user panel
const users = require('./users/routes/kidsroutes');

//admin panel
const admin = require('./admin/routes/adminroutes');
const pricing = require('./admin/routes/pricingroutes');
const profession = require('./admin/routes/professionroutes');
const features = require('./admin/routes/featuresroutes');

//brands
const brands = require('./brands/routes/brandroutes');

// Define routes
app.use('/brandsntalent_api/users',users);
app.use('/brandsntalent_api/admin',admin);
app.use('/brandsntalent_api/brands',brands);
app.use('/brandsntalent_api/pricing',pricing);
app.use('/brandsntalent_api/profession',profession);
app.use('/brandsntalent_api/features',features);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
     
try {
   
    // Start the server
    app.listen(4014, () => {
      console.log('Server is listening on port 4014');
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
  }


  