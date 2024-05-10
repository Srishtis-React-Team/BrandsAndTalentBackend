const express = require("express");
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const addMessage = async (req, res) => {
  const { title, text, fcmToken } = req.body;
  if (!fcmToken) {
    return res.status(400).json({
      status: false,
      data: "FCM Token is required"
    });
  }

  const notification = {
    title,
    text,
  };

  const notification_body = {
    notification: notification,
    to: fcmToken // Use 'to' for single device
  };

  try {
    const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification_body, {
      headers: {
        'Authorization': 'key=' + 'AAAARjamXEw:APA91bHBZ3tz5WuUrwCMI5IcuJQaufmHs2hUHUlE1su9-iPNpw3E2KTzqpVXXv2FDDa_qQV2yExoAgxgWNwF3CZAOu9IR1GO4gP04PPNK3Gv9x4UqwJUkrJFSIvEBaQZJOyjj4KujoEF', // Use environment variable for server key
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

