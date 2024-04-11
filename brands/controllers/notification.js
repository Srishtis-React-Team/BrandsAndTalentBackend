const express = require("express");
const bodyParser = require('body-parser');
const axios = require('axios');


const app = express();
app.use(bodyParser.json());



const addMessage = async (req, res, next) => {
  const notification = {
    'title': req.body.title,
    'text': req.body.text,
  };

  const fcmToken ="BOrRUsFr6qM_RnH76mGZmeCu3_zRjKrl9rshpQSB2QRRe38Q-NbFYEZ2Bm-VTapy9UgzUHw313RFfT1bu8slsp4"// req.body.fcmToken;;

  const notification_body = {
    'notification': notification,
    'to': fcmToken // Use 'to' instead of 'registration_ids' for a single device
  };
  
  try {
    const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification_body, {
      headers: {
        'Authorization': 'key='+'AAAARjamXEw:APA91bHBZ3tz5WuUrwCMI5IcuJQaufmHs2hUHUlE1su9-iPNpw3E2KTzqpVXXv2FDDa_qQV2yExoAgxgWNwF3CZAOu9IR1GO4gP04PPNK3Gv9x4UqwJUkrJFSIvEBaQZJOyjj4KujoEF', // Replace with your server key
        'Content-Type': 'application/json'
      }
    });

    console.log("Notification sent successfully", response.data);
    res.json({
      status: true,
      data: "Notification sent successfully"
    });
  } catch (error) {
    console.error("Error sending notification", error.response ? error.response.data : error.message);
    res.status(500).json({
      status: false,
      data: error.response ? error.response.data : error.message
    });
  }
}

module.exports = {
  addMessage
};



// const express = require("express");
// const bodyParser = require('body-parser');
// const axios = require('axios');

// const app = express();
// app.use(bodyParser.json());





// const addMessage = async (req, res, next) => {
//   const notification = {
//     'title': req.body.title,
//     'text': req.body.text,
//   };

//   const fcm_tokens =req.body.fcm_tokens;//['BDmNbTN_xe-1ctpoO0DDq-Fx19PBXzZiBrxiUUM6SSxWglOq8R1akV1ElE_gqLG-FoRSYkWQ6l_FD_NEL8wjN7M'] //['dODWNcNsbC4qaHs16kROb0:APA91bGHtldzne0naTsuXdx5oF-FwVG-s0N6-BD1NHCl2ajil85uA5HYUKmzLTJTttACotZdpCprtEkL1JZ-2cSCQ_9zMN-Aj8H61PjXrW7dKwRXqKjVDHJGFw6UvIRPxXKSj5id317R'];

//   const notification_body = {
//     'notification': notification,
//     'registration_ids': fcm_tokens
//   };
  
//   try {
//     const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification_body, {
//       headers: {
//         'Authorization': 'key='+'BFaZieZPIwT6ucB5L40AAji_7BchdHf2XHjBqRKPFOnST-DBT-Mu3NzyZoVk89ZLjI29U6TIVeN_kJrUI8q0wu0', // Replace with your server key
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log("Notification sent successfully", response.data);
//     res.json({
//       status: true,
//       data: "Notification sent successfully"
//     });
//   } catch (error) {
//     console.error("Error sending notification", error.response ? error.response.data : error.message);
//     res.status(500).json({
//       status: false,
//       data: error.response ? error.response.data : error.message
//     });
//   }
// }

// module.exports = {
//   addMessage
// };


