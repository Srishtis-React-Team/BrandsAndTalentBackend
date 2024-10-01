const axios = require('axios');

const Twit = require('twit');
require('dotenv').config(); // Load environment variables from .env file


/**
*********facebookCount******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


// // Your page ID and access token
const facebookCount = async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(200).json({ message: 'Missing or malformed Authorization header' });
      }
  
      const accessToken = authHeader.split(' ')[1]; // Extract token
  
      const url = `https://graph.facebook.com/v20.0/me?fields=name,about,friends&access_token=${accessToken}`;
  
      const response = await axios.get(url);
  
      console.log('Followers count:', response.data.friends.summary.total_count);
  
      res.status(200).json({
        status:true,
        name: response.data.name,
        about: response.data.about,
        Followerscount: response.data.friends.summary.total_count
      });
    } catch (error) {
      console.error('Error fetching followers count:', error);
  
      res.status(500).json({
        satstus:false,
        message: 'Error fetching Facebook data',
        error: error.response ? error.response.data : error.message
      });
    }
  };


/**
*********instagramCount******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const instagramCount = async (req, res, next) => {
  const accessToken = req.headers['authorization']; // Get the access token from the Authorization header
  const { instagramUserId } = req.body; // Get the Instagram User ID from the request body

  // Check if both accessToken and instagramUserId are provided
  if (!accessToken || !instagramUserId) {
    return res.status(200).json({ error: 'Access token and Instagram User ID are required' });
  }

  try {
    // Make the API request to the Instagram Graph API to fetch followers count
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${instagramUserId}?fields=followers_count&access_token=${accessToken}`
    );
    
    const data = await response.json();

    if (data.error) {
      // Handle error returned by the Instagram Graph API
      return res.status(200).json({ status:false,error: data.error.message });
    }

    // Respond with the followers count
    res.json({
      success: true,
      followersCount: data.followers_count,
    });
  } catch (error) {
    console.error('Error fetching followers count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


/**
*********twitterCount******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const twitterCount = async (req, res) => {
    const username = req.body.username; // Get the username from the request body
    const url = `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics`; // Add public_metrics to the request
    
    const token ='AAAAAAAAAAAAAAAAAAAAAAORvQEAAAAAoD3xmN%2FvzpfamS2RsolX66iW%2BuU%3D9F3yfTbWP5QRPUq4R9SojhT2Phwe9BF864L0idLgbLEjgciCWV'; // Replace with your actual Bearer Token

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const userData = response.data.data;
      
        // Send back the user data to the client, including the follower count from public_metrics
        res.json({
            status:true,
            screen_name: userData.username,
            followers_count: userData.public_metrics.followers_count, // Access followers count from public_metrics
            name: userData.name
        });
    } catch (error) {
        if (error.response) {
            console.log("time out")
            console.error('Error fetching Twitter data:', error.response.data);
            res.json({
                status:false,
                data:"Too Many Request,Limit Reached"
                
            });
         //   res.status(error.response.status).json({ error: error.response.data });
        } else {
            console.error('Error:', error.message);
            console.log("server error")
            res.json({
                status:false,
                data:"Too Many Request,Limit Reached"
                

               
            });
         
        }
    }
};


/**
*********youtubeCount******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const youtubeCount = async (req, res) => {
    try {
      const channelId = req.body.channelId ;//|| 'UC1Z9q-ThshlPuLn_1yQYGrw'; // Use provided channel ID or default
      const apiKey = 'AIzaSyD6OT4cLAKZk76sh_XxsB7pSCpsbnyamg8';
      const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
  
      // Fetch data from the YouTube API
      const response = await axios.get(url);
      const channelData = response.data;
  
      if (channelData.items && channelData.items.length > 0) {
        const stats = channelData.items[0].statistics;
  
        // Send back the statistics to the client
        res.json({
          status: true,
          data: {
            viewCount: stats.viewCount,
            subscriberCount: stats.subscriberCount,
            videoCount: stats.videoCount,
          },
        });
      } else {
        res.status(200).json({ status: false, msg: 'Channel not found' });
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error.message);
      res.status(500).json({ status: false, msg: 'An error occurred while fetching data' });
    }
  };
/**
*********redirect instagram******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const redirectInstagram = async (req, res) => {
  try {
    const redirectUrl = 'https://brandsandtalent.com/instagram/o-auth-redirect'; // The URL to redirect to

    console.log("Redirecting to Instagram OAuth URL");

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error redirecting to Instagram OAuth:', error.message);
    res.status(500).json({ status: false, msg: 'An error occurred while redirecting' });
  }
};



module.exports ={
    facebookCount,instagramCount,twitterCount,youtubeCount,redirectInstagram

}


