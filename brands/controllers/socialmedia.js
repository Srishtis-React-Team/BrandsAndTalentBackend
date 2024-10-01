const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const axios = require('axios');

const { followers } = require('instagram-scraping');



  
const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAGS5uAEAAAAAohdV%2FzvTfNOM2SyIvC3uejXxYoY%3DhdYpYhPrOsblehYHoayaYZCU7jQpETO96YD2fPmuBc0isoXpPU';
  // Endpoint to get user details

// Function to fetch user ID by username
const getUserIdByUsername = async (username) => {
    try {
      const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`
        },
        params: {
          'user.fields': 'id' // Specify the fields you need
        }
      });
  
      return response.data.data.id;
    } catch (error) {
      console.error('Error fetching user ID:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  
  // Function to fetch user details by user ID
  const getUserDetailsById = async (userId) => {
    try {
      const response = await axios.get(`https://api.twitter.com/2/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`
        },
        params: {
          'user.fields': 'name,description,location,public_metrics' // Specify the fields you need
        }
      });
  
      const user = response.data.data;
      return {
        name: user.name,
        description: user.description,
        location: user.location,
        followers_count: user.public_metrics.followers_count,
        following_count: user.public_metrics.following_count,
        tweet_count: user.public_metrics.tweet_count,
      };
    } catch (error) {
      console.error('Error fetching user details:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  
  // Combined endpoint to get user details by username
  const getUserDetails = async (req, res) => {
    try {
      const username = req.body.username; // Get username from the request body
  
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
  
      const userId = await getUserIdByUsername(username);
      const userDetails = await getUserDetailsById(userId);
  
      res.json(userDetails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const getInstagramaccount = async (req, res) => {
    res.send(req.params.page);
  };


  //facebook


// Replace with your actual Page ID and Access Token
const pageId = 'YOUR_PAGE_ID';
const accessToken = 'YOUR_ACCESS_TOKEN';

async function getFollowerCount() {
  try {
    const response = await axios.get(`https://graph.facebook.com/v11.0/${pageId}?fields=followers_count&access_token=${accessToken}`);
    const data = response.data;
    console.log(`Follower count for page ${pageId}:`, data.followers_count);
  } catch (error) {
    console.error('Error fetching follower count:', error.response ? error.response.data : error.message);
  }
}

getFollowerCount();
    
module.exports = {
   getUserIdByUsername,getUserDetails,getUserDetailsById,getInstagramaccount,
   getFollowerCount

};