const axios = require('axios');

const Twit = require('twit');
require('dotenv').config(); // Load environment variables from .env file


/**
*********facebookCount******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const facebookCount = async (req, res, next) => {
    const FB_PAGE_ID = process.env.FB_PAGE_ID || '380375718497650';
    const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || 'db2a72d96f8227d62b9426870637a8e7';

    async function getFacebookFollowers() {
        try {
            const response = await axios.get(`https://graph.facebook.com/v14.0/${FB_PAGE_ID}`, {
                params: {
                    fields: 'followers_count',
                    access_token: FB_PAGE_ACCESS_TOKEN
                }
            });

            const followersCount = response.data.followers_count;
            console.log(`Followers count: ${followersCount}`);
            res.json({
                data: followersCount,
                status: true
            });
        } catch (error) {
            console.error('Error fetching followers count:', error.response ? error.response.data : error.message);
            res.json({
                data: error.response ? error.response.data : error.message,
                status: false
            });
        }
    }

    await getFacebookFollowers();
};

/**
*********instagramCount******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const instagramCount = async (req, res, next) => {
// Function to get Instagram followers count
async function getInstagramFollowers() {
    const igBusinessAccountId = process.env.IG_BUSINESS_ACCOUNT_ID; // Fetch from .env
    const userAccessToken = process.env.IG_USER_ACCESS_TOKEN; // Fetch from .env

    try {
        const response = await axios.get(`https://graph.facebook.com/v14.0/${igBusinessAccountId}`, {
            params: {
                fields: 'followers_count',
                access_token: userAccessToken
            }
        });

        const followersCount = response.data.followers_count;
        console.log(`Instagram Followers count: ${followersCount}`);
        return followersCount;
    } catch (error) {
        console.error('Error fetching Instagram followers count:', error.response ? error.response.data : error.message);
        res.json(({
            data:error
        }))
    }
}
getInstagramFollowers();
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
        console.log("ssjfdjkgnkjfdhgkfj")

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
            //res.status(500).json({ error: 'Server error' });
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
      const channelId = req.body.channelId || 'UC1Z9q-ThshlPuLn_1yQYGrw'; // Use provided channel ID or default
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
        res.status(404).json({ status: false, msg: 'Channel not found' });
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error.message);
      res.status(500).json({ status: false, msg: 'An error occurred while fetching data' });
    }
  };

 

const accessToken = 'AQXnBnDieLRKzhM-CYb21HKzjEbacP17F6pRSK-uW6iGY-GAzB0BhlG6xW6uQ_orkNSnqoZUmPLOSflHJG0uPzLLxAtwUI6_Oa5bsbbXkb7GIJELKHLWDT3rIPHSv4b7Z0M_jc40OyciWQ5b6tbaNHnfh-VzGKDczSksjUp80_Wi6UfmQIcZn7DsqGvuSx8gVLDiJVuaQ53RekFEEsHiZeOjDSXKh4-ySgfPyMJdhCOo1_-3ufuqqcQcDjjKA_ZfBibWmGf3h9_tsf8eyHevofCaVjlmQVey7ca-r0BRiU_XWVdjB08kNtfsgCDigOr-kZxW3xqFM1pZBZZwt2gfi9DWMX_xtg';
const organizationUrn = 'urn:li:organization:YOUR_ORG_URN';

axios.get(`https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${organizationUrn}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
.then(response => {
  const followerCount = response.data.elements[0].followerCounts.organizationalEntityFollowerCount;
  console.log(`The organization has ${followerCount} followers.`);
})
.catch(error => {
  console.error('Error fetching follower count:', error);
});


module.exports ={
    facebookCount,instagramCount,twitterCount,youtubeCount

}


