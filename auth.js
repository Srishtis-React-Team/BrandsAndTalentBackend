const passport=require("passport");
const kidsmodel = require("./users/models/kidsmodel");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

require('dotenv').config()
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:4014/auth/google/callback",
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
      let user = await kidsmodel.findOne({ childEmail: userEmail });

      // If user does not exist, create a new user
      if (!user) {
        user = await kidsmodel.create({
          googleId: profile.id,
          childEmail: userEmail,
          // Add other user properties as needed
        });
        console.log("userEmail",userEmail)
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

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:4014/auth/google/callback",
//     passReqToCallback: true,
//     scope: ['profile', 'email']
//   },
//   async function(req, accessToken, refreshToken, profile, cb) {
//     try {
//       if (!profile || !profile.id) {
//         throw new Error('Profile or profile ID is undefined');
//       }

//       // Use async/await to handle asynchronous operation (e.g., database query)
//       let user = await kidsmodel.findOne({ googleId: profile.id });
     

//       // If user does not exist, create a new user
//       if (!user) {
//         user = await kidsmodel.create({
//           googleId: profile.id,
         
//           // Add other user properties as needed
//         });
        
//       }

//       // Pass the user to the callback function
//       return cb(null, user);
//     } catch (error) {
//       // Handle error
//       console.error('Error in GoogleStrategy:', error);
//       return cb(error);
//     }
//   }
// ));


passport.serializeUser((user,done)=>{
    done(null,user);

});
passport.deserializeUser((user,done)=>{
    done(null,user);

});



// const router=require("express").Router();
// const passport=require("passport");

// router.get("/login/success",(req,res)=>{
//     if(req.user){
//         res.status(200).json({
//             error:false,
//             message:"Successfully Loged In",
//             user:req.user
//         })
//     }
//     else{
//         res.status(403).json({error:true,message:"Not Authorized"})

//     }
   

// });

// router.get("/login/failed",(req,res)=>{
//     res.status(401).json({
//         error:true,
//         message:"Log in failure"

//     })

// });
   


// router.get(
//     "/google/callback",
//     passport.authenticate("google",{
//         successRedirect:process.env.CLIENT_URL,
//         failureRedirect:"/login/failed",
//     })
// );
// router.get("google",passport.authenticate("google",["profile","email"]));

// router.get("logout",(req,res)=>{
//     req.logout();
//     res.redirect(process.env.CLIENT_URL);

// });
// module.exports=router;