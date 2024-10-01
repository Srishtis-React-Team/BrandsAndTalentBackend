// Define getBusinessReviewEmailTemplate function
const getBusinessReviewEmailTemplate = (userId

	
) =>
`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div style="text-align: center;">
    <div class="welcome-text" style="color: #000; font-family: sans-serif; font-size: 18px; font-style: normal; font-weight: 400; padding: 20px;">Welcome To Brands and Talent</div>
    <div class="main" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 1px 8px 24px 0px rgba(0, 0, 0, 0.1); background-color: #ffffff; border-radius: 10px;">
      <div class="img" style="margin-bottom: 20px;">
        <img class="bt-img" src="https://brandsandtalent.com/backend/uploads/825f87f1-8d62-44cb-baef-b3f5eccc204b.png" alt="">
      </div>
      <div class="title" style="color: #c2114b; font-family: sans-serif; font-size: 26px; font-weight: 600; margin-bottom: 10px;">Congratulations!</div>
      <div class="description" style="color: #000; font-family: sans-serif; font-size: 16px; margin-bottom: 20px;">
        Your account has been successfully activated, granting you full access to our platform. Feel free to log in and continue exploring our platform with your newly activated account.
      </div>
      <div class="btn" style="display: inline-block; width: 180px; height: 52px; background-color: #000; color: #fff; font-family: sans-serif; font-size: 17px; font-weight: 400; text-align: center; line-height: 52px; border-radius: 50px;">
        <a href="https://brandsandtalent.com/login?type=talent&user_id=${userId}" style="color: #fff; text-decoration: none; display: block; width: 100%; height: 100%;">Login Now</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;

// Define chatTemplate function
const chatKidsTemplate = () => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chatbot Buttons</title>
    <style>
      body {
        font-family: "Open Sans", sans-serif;
        margin: 0;
        padding: 20px;
      }
      h4 {
        font-family: "Open Sans", sans-serif;
        font-size: 16px;
      }
      .button {
        display: inline-block;
        background-color: #c2124b;
        color: #ffffff;
        padding: 6px 10px;
        text-decoration: none;
        margin: 10px 0px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
        font-family: "Open Sans", sans-serif;
        font-size: 14px;
        font-weight: 700;
        text-align: center;
        width: 100px;
      }
      .button-wrapper {
        display: flex;
        flex-direction: column;
      }
      p {
        padding: 0px !important;
      }
      a:hover {
        color: #ffffff;
      }
    </style>
  </head>
  <body>
    <h4>Choose Any Options :</h4>
    <div class="button-wrapper">
      <a
        class="button"
        href="https://brandsandtalent.com/talent-signup-basic-details"
        target="_blank"
        >Add Profile</a
      >
      <a
        class="button"
        href="https://brandsandtalent.com/login"
        target="_blank"
        >Login</a
      >
     
    </div>
  </body>
</html>
`;
const chatAdultTemplate = () => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chatbot Buttons</title>
    <style>
      body {
        font-family: "Open Sans", sans-serif;
        margin: 0;
        padding: 20px;
      }
      h4 {
        font-family: "Open Sans", sans-serif;
        font-size: 16px;
      }
      .button {
        display: inline-block;
        background-color: #c2124b;
        color: #ffffff;
        padding: 6px 10px;
        text-decoration: none;
        margin: 10px 0px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
        font-family: "Open Sans", sans-serif;
        font-size: 14px;
        font-weight: 700;
        text-align: center;
        width: 100px;
      }
      .button-wrapper {
        display: flex;
        flex-direction: column;
      }
      p {
        padding: 0px !important;
      }
      a:hover {
        color: #ffffff;
      }
    </style>
  </head>
  <body>
    <h4>Choose Any Options :</h4>
    <div class="button-wrapper">
      <a
        class="button"
        href="https://brandsandtalent.com/adult-signup"
        target="_blank"
        >Add Profile</a
      >
      <a
        class="button"
        href="https://brandsandtalent.com/login"
        target="_blank"
        >Login</a
      >
      
    </div>
  </body>
</html>
`;
const chatBrandsTemplate = () => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chatbot Buttons</title>
    <style>
      body {
        font-family: "Open Sans", sans-serif;
        margin: 0;
        padding: 20px;
      }
      h4 {
        font-family: "Open Sans", sans-serif;
        font-size: 16px;
      }
      .button {
        display: inline-block;
        background-color: #c2124b;
        color: #ffffff;
        padding: 6px 10px;
        text-decoration: none;
        margin: 10px 0px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
        font-family: "Open Sans", sans-serif;
        font-size: 14px;
        font-weight: 700;
        text-align: center;
        width: 100px;
      }
      .button-wrapper {
        display: flex;
        flex-direction: column;
      }
      p {
        padding: 0px !important;
      }
      a:hover {
        color: #ffffff;
      }
    </style>
  </head>
  <body>
    <h4>Choose Any Options :</h4>
    <div class="button-wrapper">
      
      <a
        class="button"
        href="https://brandsandtalent.com/brand-firstGig"
        target="_blank"
        >Sign Up
      </a>
      <a
        class="button"
        href="https://brandsandtalent.com/create-jobs"
        target="_blank"
        >Create job</a
      >
    </div>
  </body>
</html>
`;

//fb
const fb_login = () => `
<!DOCTYPE html>
<html lang="en">
  <head></head>
  <body>
    <h2>Add Facebook Login to your webpage</h2>

    <!-- Set the element id for the JSON response -->

    <p id="profile"></p>

    <script>
      <!-- Add the Facebook SDK for Javascript -->

      (function (d, s, id) {
        var js,
          fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");

      window.fbAsyncInit = function () {
        FB.init({
          appId: "1181042396480867",
          xfbml: true,
          version: "v17.0",
        });
        
        FB.login(function (response) {
            if (response.authResponse) {
                console.log("Welcome!  Fetching your information.... ");
                FB.api("/me", { fields: "name, email, friends" }, function (response) {
                    console.log(response);
                    document.getElementById("profile").innerHTML = "Good to see you, " + response.name + ". i see your email address is " + response.email;
                });
            } else {
                // <!-- If you are not logged in, the login dialog will open for you to login asking for permission to get your public profile and email -->
                console.log("User cancelled login or did not fully authorize.");
            }
        });
      };
    </script>
  </body>
</html>
`
;

// Export the functions
module.exports = {
    getBusinessReviewEmailTemplate,
    chatKidsTemplate,
    chatAdultTemplate,
    chatBrandsTemplate,
    fb_login
   
    
    
};


//     module.exports = {
//         getBusinessReviewEmailTemplate
        
//     };