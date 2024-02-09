const getBusinessReviewEmailTemplate = (

	
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
        <img class="bt-img" src="https://hybrid.sicsglobal.com/project/brandsandtalent/backend/uploads/825f87f1-8d62-44cb-baef-b3f5eccc204b.png" alt="">
      </div>
      <div class="title" style="color: #c2114b; font-family: sans-serif; font-size: 26px; font-weight: 600; margin-bottom: 10px;">Congratulations!</div>
      <div class="description" style="color: #000; font-family: sans-serif; font-size: 16px; margin-bottom: 20px;">
        Your account has been successfully activated, granting you full access to our platform. Feel free to log in and continue exploring our platform with your newly activated account.
      </div>
      <div class="btn" style="display: inline-block; width: 180px; height: 52px; background-color: #000; color: #fff; font-family: sans-serif; font-size: 17px; font-weight: 400; text-align: center; line-height: 52px; border-radius: 50px;">
        <a href="https://hybrid.sicsglobal.com/project/brandsandtalent/login" style="color: #fff; text-decoration: none; display: block; width: 100%; height: 100%;">Login Now</a>
      </div>
    </div>
  </div>
</body>
</html>







    `;

    module.exports = {
        getBusinessReviewEmailTemplate
        
    };