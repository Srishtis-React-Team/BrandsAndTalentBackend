const jwt = require("jsonwebtoken");
class authentication {
  gettoken(user_id, email) {


    const token = jwt.sign(
      { user_id: user_id, email },
      `${process.env.TOKEN_KEY}`,    //TOKEN_SECRET
      
      {
        expiresIn: "6h",
      }
    );

    return token;
  }
 

  CheckAuth(token, usrid) {


    return new Promise(function (resolve, reject) {

      try {
        if (!token)
          return reject('Please pass token');

        const verified = jwt.verify(token, `${process.env.TOKEN_KEY}`);

        if (!verified)
          return reject('Token could not be generated');
        else {
          if (verified.user_id == usrid)

            return resolve(verified);

          else

            return reject('invalid user');


        }


      } catch (error) {

        return reject(error.message);
      }


    })

  }
}



module.exports = authentication;
