const passport=require("passport");
const kidsmodel = require("./users/models/kidsmodel");
const adultmodel = require("./users/models/adultmodel");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

require('dotenv').config()
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:4014/auth/google/callback",
   // callbackURL: "https://hybrid.sicsglobal.com/brandsntalent_api/auth/google/callback",
    passReqToCallback: true,
    scope: ['profile', 'email']
  },
  async function(req, accessToken, refreshToken, profile, cb) {
    try {
      if (!profile || !profile.emails || !profile.emails.length) {
        throw new Error('Email not provided in the Google profile');
      }

      // Use the first email in the list of emails as the user's email address
      const userEmail = profile.emails[0].value;

      // Use async/await to handle asynchronous operation (e.g., database query)
      let user = await adultmodel.findOne({ adultEmail: userEmail });

      // If user does not exist, create a new user
      if (!user) {
        user = await adultmodel.create({
          googleId: profile.id,
          adultEmail: userEmail,
          // Add other user properties as needed
        });
        console.log("userEmail",userEmail)
        console.log("profile",profile)
      
        
      }

      // Pass the user to the callback function
      return cb(null, user);
    } catch (error) {
      // Handle error
      console.error('Error in GoogleStrategy:', error);
      return cb(error);
    }
  }
));




passport.serializeUser((user,done)=>{
    done(null,user);

});
passport.deserializeUser((user,done)=>{
    done(null,user);

});
