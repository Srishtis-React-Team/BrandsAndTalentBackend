const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import uuid

const blogmodel = require('../models/blogmodel');
const brandsmodel = require('../../brands/models/brandsmodel');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const adultmodel = require('../../users/models/adultmodel');
const kidsmodel = require('../../users/models/kidsmodel');
var loginData = require('../../emailCredentials.js');
const { gmail: { host, pass } } = loginData;

/*
*********addBlog*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

// Function to send email (implement this function based on your email service)
const sendEmail = (email, content) => {
  const nodemailer = require('nodemailer');


  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: host,
      pass: pass
    }

  });

  let mailOptions = {
    from: host, // replace with your email
    to: email,
    subject: 'New Blogs For You!',
    html: content
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Email error: ', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
const addBlog = async (req, res, next) => {
  try {
    console.log(req.body);

    // Create new blog entry
    const newBlog = new blogmodel({
      image: req.body.image,
      title: req.body.title,
      heading: req.body.heading,
      description: req.body.description,
      type: req.body.type,
      mainTitle: 'FEATURED ARTICLES',
      isActive: true
    });

    // Save blog entry to the database
    const response = await newBlog.save();

    // Send email notifications after adding a new blog
    await sendEmailNotifications();

    res.status(200).json({
      message: 'Blog added successfully and notifications sent',
      data: response
    });
  } catch (error) {
    console.error('Error adding blog or sending notifications:', error);
    res.status(500).json({ message: 'Failed to add blog and send notifications', error: error.toString() });
  }
};

// Function to fetch emails and send notifications
const sendEmailNotifications = async () => {
  try {
    // Generate blog content
    const blogContent = `
    <p>
    Hi [User's name],
    <br>
Congratulations for joining Brands & Talent Community.
<br>
Check out my latest blog on <a href="https://hybrid.sicsglobal.com/project/brandsandtalent/blogs"><strong>https://hybrid.sicsglobal.com/project/brandsandtalent/blogs</strong></a>.
<br>
See ya soon!
<br>
BT Team.
</p>
    `;




    // Fetch subscribed adults' emails
    const subscribedAdults = await adultmodel.find({ isSubscribed: true, isActive: true }, 'adultEmail preferredFirstname');

    // Fetch all brands' emails
    const brands = await brandsmodel.find({ isSubscribed: true, isActive: true }, 'brandEmail brandName');

    // Fetch all parents' emails
    const kids = await kidsmodel.find({ isSubscribed: true, isActive: true }, 'parentEmail preferredFirstname');

    // Collect all emails to send the notification
    const emailsToSend = [
      ...subscribedAdults.map(adult => ({ email: adult.adultEmail, name: adult.preferredChildFirstname })),
      ...brands.map(brand => ({ email: brand.brandEmail, name: brand.brandName })),
      ...kids.map(kid => ({ email: kid.parentEmail, name: kid.preferredChildFirstname }))
    ];

    // Send emails to all collected emails
    for (const { email, name } of emailsToSend) {
      const personalizedContent = blogContent.replace('[User\'s name]', name || 'User');
      sendEmail(email, personalizedContent);
    }

  } catch (error) {
    console.error('Error in email notifications:', error);
  }
};
//cron.schedule('* * * * * *', sendEmailNotifications);
// Schedule the job to run on the 1st and 15th of every month at 10:00 AM
cron.schedule('0 10 1,15 * *', sendEmailNotifications);

console.log('Cron job scheduled to send emails on the 1st and 15th of each month at 10:00 AM');





//  const addBlog = async (req, res, next) => {
//     try {
//         console.log(req.body);
//         const addBlog = new blogmodel({
//             image: req.body.image,
//             title: req.body.title,
//             heading: req.body.heading,
//             description: req.body.description,
//             type: req.body.type,
//             mainTitle:'FEATURED ARTICLES',
//             isActive: true
//         });

//         const response = await addBlog.save();
//         return res.json({
//             message: "Added Successfully",
//             status: true,
//             data: addBlog,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.json({
//             message: "An Error Occurred"
//         });
//     }
// };
/*
*********fetchBlogByType*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const fetchBlogByType = async (req, res) => {
  try {
    const type = req.body.type;

    // Fetch content items based on contentType
    let blog;

    if (type === 'All') {
      blog = await blogmodel.find({ isActive: true });
    } else {
      blog = await blogmodel.find({ type: type, isActive: true });
    }

    if (!blog || blog.length === 0) {
      return res.status(200).json({
        message: "Blogs not found",
        status: false
      });
    }

    return res.json({
      message: "Blogs retrieved successfully",
      status: true,
      data: blog
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
      status: false
    });
  }
};

/*
*********getFeaturedArticles*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const getFeaturedArticles = async (req, res) => {
  try {


    // Fetch content items based on contentType
    const blog = await blogmodel.find({ mainTitle: 'FEATURED ARTICLES', isActive: true });

    if (!blog) {
      return res.status(200).json({
        message: "Blog not found",
        status: false
      });
    }

    return res.json({
      message: "blog retrieved successfully",
      status: true,
      data: blog
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An Error Occurred",
      status: false
    });
  }
};
/*
*********deleteBlog*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const deleteBlog = async (req, res) => {
  try {
    const { _id } = req.body;

    // Assuming you have a model named 'blog'
    const result = await blogmodel.findByIdAndUpdate(
      _id,
      { isActive: false },
      { new: true } // This option returns the updated document
    );

    if (result) {
      res.json({
        status: true,
        message: 'Blog successfully updated to inactive',
        data: result,
      });
    } else {
      res.json({
        status: false,
        message: 'Blog not found',
      });
    }
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      status: false,
      message: 'Error occurred while updating blog',
    });
  }
};

/*
*********editBlog*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/


const editBlog = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;

    // Validate if _id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(200).json({
        message: "Invalid _id format",
        status: false
      });
    }

    // Update the document by its _id
    const updatedBlog = await blogmodel.findByIdAndUpdate(
      _id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedBlog) {
      return res.status(200).json({
        message: "Blog document not found",
        status: false
      });
    }

    return res.json({
      message: "Blog item updated successfully",
      status: true,
      data: updatedBlog
    });
  } catch (error) {
    console.error("Error occurred while updating blog:", error);
    return res.status(500).json({
      message: "An error occurred",
      status: false
    });
  }
};





module.exports = {
  addBlog, fetchBlogByType, deleteBlog, editBlog, getFeaturedArticles

};
