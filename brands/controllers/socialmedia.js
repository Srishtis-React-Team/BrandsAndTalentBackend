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


  //instagram followers

    
  // Combined endpoint to get user details by username

  
  // const getInstagramCount = async (req, res) => {
  //   try {
  //     const username = req.params.username;
  
  //     // Fetch the follower count
  //     const count = await followers(username);

  //     console.log("username",count)
  
  //     // Check if the account was found
  //     if (!count) {
  //       return res.status(404).json({ error: 'Account not found' });
  //     }
  
  //     // Send a structured JSON response
  //     res.json({
  //       username: username,
  //       followers_count: count,
  //     });
  //   } catch (error) {
  //     console.error('Error fetching Instagram followers:', error.message);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // };




  const getInstagramaccount = async (req, res) => {
    res.send(req.params.page);
  };
    
module.exports = {
   getUserIdByUsername,getUserDetails,getUserDetailsById,getInstagramaccount//getInstagramCount

};