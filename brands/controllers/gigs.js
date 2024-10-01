const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const axios = require('axios');
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
var loginData = require('../../emailCredentials.js');
const { gmail: { host, pass } } = loginData;
const cron = require('node-cron');

const nodemailer = require('nodemailer');
// Adjust the path as needed


const gigsmodel = require('../models/gigsmodel');
const draftmodel = require("../models/draftmodel");
const brandsmodel = require("../models/brandsmodel");
const kidsmodel = require("../../users/models/kidsmodel");
const adultmodel = require("../../users/models/adultmodel");
const notificationmodel = require("../models/notificationmodel");
const applymodel = require("../models/applymodel.js");
const favouritesgigsmodel = require("../models/favouritesgigsmodel.js");
const userdatamodel = require("../models/userdatamodel.js");

/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const createJob = async (req, res, next) => {
    try {
        const add_gigs = new gigsmodel({
            jobTitle, jobLocation, streetAddress, employmentType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage, country, state, city, jobPostedDate, category, lastDateForApply,
            minAge, maxAge, instaMin, instaMax, tikTokMin, tikTokMax, linkedInMin, linkedInMax, fbMin, fbMax, twitterMin, twitterMax,
            youTubeMin, youTubeMax
            // isActive: true
        } = req.body);

        const response = await add_gigs.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: add_gigs,
        });
    } catch (error) {

        return res.json({
            message: "An Error Occurred"
        });
    }
};



/**
*********recentGigs******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getPostedJobs = async (req, res, next) => {
    const talentId = req.body.talentId;

    try {
        const today = new Date();
        // Fetching all active gigs and sorting them by creation date in descending order
        // const gigs = await gigsmodel.find({ isActive: true, lastDateForApply: { $gte: today },adminApproved:true}).sort({ created: -1 }).exec();//adminApproved:true 
        const gigs = await gigsmodel.find({ isActive: true, lastDateForApply: { $gte: today }, adminApproved: true }).sort({ created: -1 }).exec();//adminApproved:true 
        const favoriteGigs = await favouritesgigsmodel.find({ isActive: true, talentId: talentId, isFavourite: true }).sort({ created: -1 }).exec();

        // Matching gigId details fetch from favoriteGigs
        const favoriteGigIds = favoriteGigs.map(favGig => favGig.gigId.toString());

        console.log("favoriteGigIds", favoriteGigIds)
        console.log("gigs", gigs)

        // Create modified data with an "isApplied" status
        const modifiedData = await Promise.all(gigs.map(async (gig) => {

            const application = await notificationmodel.findOne({ gigId: gig._id, talentId: talentId });
            console.log("application", application)
            return {
                ...gig._doc,
                isFavorite: favoriteGigIds.includes(gig._id.toString()),
                isApplied: application ? "Applied" : "Apply Now"
            };
        }));

        // Reverse the array to make it oldest to newest
        modifiedData.reverse();

        // Sending the reversed array as response
        res.json({
            status: true,
            data: modifiedData
        });
    } catch (error) {

        res.status(500).json({
            status: false,
            message: 'Error fetching posted jobs',
            error: error.message
        });
    }
};


/**
*********get job by id******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getJobsByID = async (req, res, next) => {
    try {
        const gigId = req.body.gigId || req.params.gigId;


        // Since we're using async/await, there's no need to use .then() and .catch() here.
        const gig = await gigsmodel.findOne({ _id: gigId, isActive: true, adminApproved: true }).sort({ created: -1 });//adminApproved:true

        if (!gig) {
            // If no gig is found, send a 404 not found response
            return res.status(200).json({
                status: false,
                message: 'Gig not found'
            });
        }

        // If a gig is found, send it back in the response
        res.json({
            status: true,
            data: gig
        });

    } catch (error) {
        // Log the error and send a 500 internal server error response

        res.status(500).json({
            status: false,
            message: 'Server error'
        });
    }
};

/**
 *********draft gig******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

// Function to save notifications to the database

const notificationsave = async (brandId, gigId, adminApproved, notificationMessage, lastDateForApply) => {
    try {

        const brand = await findUserById(brandId);

        const notification = new notificationmodel({
            notificationType: 'Job Approval',
            notificationMessage: notificationMessage,
            brandId: brandId,
            gigId: gigId,
            adminApproved: adminApproved,
            brandDetails: {
                _id: brand._id,
                brandName: brand.brandName,
                brandEmail: brand.brandEmail,
                logo: brand.logo,
                brandImage: brand.brandImage
            },
            gigDetails: {
                lastDateForApply: lastDateForApply

            },


        });

        const savedNotification = await notification.save();

    } catch (error) {
        console.error("Error saving notification:", error);
    }
};
// Helper function to find a user by their ID
async function findUserById(userId) {
    try {
        const brand = await brandsmodel.findOne({ _id: userId, isActive: true, inActive: true });
        if (brand) return brand;

        const kidTalent = await kidsmodel.findOne({ _id: userId, inActive: true, isActive: true });
        if (kidTalent) return kidTalent;

        const adultTalent = await adultmodel.findOne({ _id: userId, inActive: true, isActive: true });
        if (adultTalent) return adultTalent;

        return null;
    } catch (error) {

        return null;
    }
}

// Helper function to determine the user type based on their ID
async function determineUserType(userId) {
    const isBrand = await brandsmodel.exists({ _id: userId });
    if (isBrand) return 'brand';

    const isKid = await kidsmodel.exists({ _id: userId });
    if (isKid) return 'kids';

    const isAdult = await adultmodel.exists({ _id: userId });
    if (isAdult) return 'adult';

    return null;
}

// Configure Nodemailer



const emailSend = async (to, subject, html) => {
    const mailOptions = {
        from: host,
        to: to,
        subject: subject,
        html: html
    };

    await transporter.sendMail(mailOptions);
};



const draftJob = async (req, res, next) => {
    try {

        const { brandId } = req.body;

        // Fetch brand details to check the plan
        const brand = await brandsmodel.findById(brandId);

        if (!brand) {
            return res.status(200).json({ message: "Brand not found" });
        }

        // Determine job limit per month based on the plan
        let jobLimitPerMonth;
        switch (brand.planName) {
            case 'Basic':
                jobLimitPerMonth = 3;
                break;
            case 'Pro':
                jobLimitPerMonth = 5;
                break;
            case 'Premium':
                jobLimitPerMonth = 15;
                break;
            default:
                return res.status(400).json({ message: "Invalid plan name" });
        }

        // Get the current date and first day of the current month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);



        // Count the jobs posted by the brand this month
        const jobCount = await draftmodel.countDocuments({
            brandId: brandId,
            createdAt: { $gte: firstDayOfMonth, $lte: currentDate }
        });



        if (jobCount >= jobLimitPerMonth) {
            return res.status(200).json({
                status: false,
                statusInfo: "limit-reached",
                message: "This month's job posting limit has been reached."
                //`Job posting limit for this month (${jobLimitPerMonth}) reached. Upgrade to Pro or Premium to post more.`
            });
        }
        // Create a new draft job
        // Check if plan is Pro or Premium to set isApproved and adminApproved
        const isProOrPremium = brand.planName === 'Pro' || brand.planName === 'Premium';
        const isAdminApproved = isProOrPremium ? true : false;


        if (brand.planName === 'Pro' || brand.planName === 'Premium') {
            // If the plan is Pro or Premium, set isApproved field to true
            req.body.isApproved = true;

            //adminApproved=true;

        }
        const add_gigs = new draftmodel({
            brandId: req.body.brandId,
            jobTitle: req.body.jobTitle,
            jobLocation: req.body.jobLocation,
            streetAddress: req.body.streetAddress,
            employmentType: req.body.employmentType,
            jobType: req.body.jobType,
            jobDescription: req.body.jobDescription,
            skills: req.body.skills,
            additionalRequirements: req.body.additionalRequirements,
            age: req.body.age,
            gender: req.body.gender,
            nationality: req.body.nationality,
            languages: req.body.languages,
            questions: req.body.questions,
            benefits: req.body.benefits,
            compensation: req.body.compensation,
            jobCurrency: req.body.jobCurrency,
            paymentType: req.body.paymentType,
            minPay: req.body.minPay,
            maxPay: req.body.maxPay,
            hiringCompany: req.body.hiringCompany,
            whyWorkWithUs: req.body.whyWorkWithUs,
            product: req.body.product,
            valueOfProduct: req.body.valueOfProduct,
            productDescription: req.body.productDescription,
            hiringCompanyDescription: req.body.hiringCompanyDescription,
            howLikeToApply: req.body.howLikeToApply,
            workSamples: req.body.workSamples,
            jobImage: req.body.jobImage,
            brandImage: req.body.brandImage,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            jobPostedDate: req.body.jobPostedDate,
            lastDateForApply: req.body.lastDateForApply,
            category: req.body.category,
            minAge: req.body.minAge,
            maxAge: req.body.maxAge,
            instaMin: req.body.instaMin,
            instaMax: req.body.instaMax,
            tikTokMin: req.body.tikTokMin,
            tikTokMax: req.body.tikTokMax,
            linkedInMin: req.body.linkedInMin,
            linkedInMax: req.body.linkedInMax,
            fbMin: req.body.fbMin,
            fbMax: req.body.fbMax,
            twitterMin: req.body.twitterMin,
            twitterMax: req.body.twitterMax,
            youTubeMin: req.body.youTubeMin,
            youTubeMax: req.body.youTubeMax,
            isApproved: req.body.isApproved,
            adminApproved: isAdminApproved
        });

        const response = await add_gigs.save();


        if (brand.planName == 'Basic') {

            // Check in the notification model if a notification for this talent already exists
            const notificationExists = await notificationmodel.findOne({
                notificationType: "Job Approval",
                brandId: brandId
            });

            //if (!notificationExists) {
            // Retrieve parentEmail and parentFirstName from the existing user document
            const brandEmail = brand.brandEmail;
            const brandName = brand.brandName;

            const emailContent = `
            <p>Hello ${brandName},</p>
            <p>Your job Approved by admin within 2 business days. You will receive a team approval confirmation.</p>
            <p>Best regards</p>
            <p>Brands and Talent Team</p>
            `;

            const notificationMessage = `The brand ${brandName}, posted a job.Please approve them.`;

            // Send notification and email

            await notificationsave(brandId, response._id, response.adminApproved, notificationMessage);
            await emailSend(brandEmail, 'Approval', emailContent);

        }




        return res.json({
            message: "Draft Added Successfully",
            status: true,
            data: response,

        });
    } catch (error) {

        return res.status(500).json({ message: "An Error Occurred" });
    }
};




/**
*********get darft job by id******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getDraftJobsByID = async (req, res, next) => {
    try {
        const gigId = req.body.gigId || req.params.gigId;
        // const userId = req.body.userId || req.params.userId;  
        /* Authentication (Uncomment and adjust as necessary)
        const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
        if (!authResult) {
          return res.status(401).json({ status: false, msg: 'Authentication failed' });
        }
        */

        // Since we're using async/await, there's no need to use .then() and .catch() here.
        const gig = await draftmodel.findOne({ _id: gigId, isActive: true }).sort({ created: -1 });

        if (!gig) {
            // If no gig is found, send a 404 not found response
            return res.status(200).json({
                status: false,
                message: 'Gig not found'
            });
        }

        // If a gig is found, send it back in the response
        res.json({
            status: true,
            data: gig
        });

    } catch (error) {
        // Log the error and send a 500 internal server error response

        res.status(500).json({
            status: false,
            message: 'Server error'
        });
    }
};
/**
*********recentGigs******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getDraftJobs = async (req, res, next) => {

    draftmodel.find({ isActive: true }).sort({ created: -1 })
        .then((response) => {
            res.json({
                status: true,
                data: response
            });
        })
        .catch((error) => {
            res.json({
                Status: false,
            });
        });
};
/**
*********post job by Draft******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

// Function to send notifications using FCM
const sendNotifications = async (fcmToken, title, text) => {
    if (!fcmToken) {
        console.error("FCM Token is required");
        return;
    }

    const notification = {
        title,
        text,
    };

    const notification_body = {
        notification: notification,
        to: fcmToken
    };

    try {
        const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification_body, {
            headers: {
                'Authorization': 'key=' + 'AAAARjamXEw:APA91bHBZ3tz5WuUrwCMI5IcuJQaufmHs2hUHUlE1su9-iPNpw3E2KTzqpVXXv2FDDa_qQV2yExoAgxgWNwF3CZAOu9IR1GO4gP04PPNK3Gv9x4UqwJUkrJFSIvEBaQZJOyjj4KujoEF', // Use environment variable for server key
                'Content-Type': 'application/json'
            }
        });

        console.log("Notification sent successfully", response.data);
    } catch (error) {
        console.error("Error sending notification", error.response ? error.response.data : error.message);
    }
};

// Function to save notifications to the database
const saveNotification = async (brandId, talentId, gigId, brandNotificationMessage) => {
    try {
        // Fetch details of brand and gig
        const brand = await findUserById(brandId);
        const gig = await gigsmodel.findById(gigId);

        // Create the notification document
        const notification = new notificationmodel({
            notificationType: 'Job Post',
            brandId: brandId,
            gigId: gigId,
            brandNotificationMessage: brandNotificationMessage,
            brandDetails: {
                _id: brand._id,
                brandName: brand.brandName,
                brandEmail: brand.brandEmail,
                logo: brand.logo,
                brandImage: brand.brandImage
            },
            gigDetails: {
                jobTitle: gig.jobTitle,
                category: gig.category,
                minAge: gig.minAge,
                maxAge: gig.maxAge,
                instaMin: gig.instaMin,
                instaMax: gig.instaMax,
                tikTokMin: gig.tikTokMin,
                tikTokMax: gig.tikTokMax,
                linkedInMin: gig.linkedInMin,
                linkedInMax: gig.linkedInMax,
                fbMin: gig.fbMin,
                fbMax: gig.fbMax,
                twitterMin: gig.twitterMin,
                twitterMax: gig.twitterMax,
                youTubeMin: gig.youTubeMin,
                youTubeMax: gig.youTubeMax
            }
        });

        // Save the notification document
        const savedNotification = await notification.save();
        console.log("Notification saved successfully", savedNotification);
    } catch (error) {
        console.error("Error saving notification:", error);
    }
};

// Configure Nodemailer



const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: host,
        to: to,
        subject: subject,
        html: html
    };

    await transporter.sendMail(mailOptions);
};






// Function to post a job by draft and send notifications
const postJobByDraft = async (req, res, next) => {
    try {
        // Extract gigId from request body or parameters
        const gigId = req.body.gigId || req.params.gigId;

        // Check if gigId is provided
        if (!gigId) {
            return res.status(400).json({
                status: false,
                message: 'Gig ID is required'
            });
        }

        // Find the draft gig with the provided gigId
        const draftGig = await draftmodel.findOne({ _id: gigId, isActive: true, adminApproved: true });


        // Check if draft gig exists
        if (!draftGig) {
            return res.status(200).json({
                status: false,
                message: 'The admin needs to approve this job'
            });
        }

        // Create a new gig using the details from draftGig
        const newGig = new gigsmodel({
            jobPostedDate: draftGig.jobPostedDate,
            lastDateForApply: draftGig.lastDateForApply,
            country: draftGig.country,
            state: draftGig.state,
            city: draftGig.city,
            brandImage: draftGig.brandImage,
            brandId: draftGig.brandId,
            jobTitle: draftGig.jobTitle,
            jobType: draftGig.jobType,
            jobLocation: draftGig.jobLocation,
            streetAddress: draftGig.streetAddress,
            employmentType: draftGig.employmentType,
            jobDescription: draftGig.jobDescription,
            skills: draftGig.skills,
            additionalRequirements: draftGig.additionalRequirements,
            age: draftGig.age,
            gender: draftGig.gender,
            nationality: draftGig.nationality,
            languages: draftGig.languages,
            questions: draftGig.questions,
            benefits: draftGig.benefits,
            compensation: draftGig.compensation,
            jobCurrency: draftGig.jobCurrency,
            paymentType: draftGig.paymentType,
            minPay: draftGig.minPay,
            maxPay: draftGig.maxPay,
            hiringCompany: draftGig.hiringCompany,
            whyWorkWithUs: draftGig.whyWorkWithUs,
            product: draftGig.product,
            valueOfProduct: draftGig.valueOfProduct,
            productDescription: draftGig.productDescription,
            hiringCompanyDescription: draftGig.hiringCompanyDescription,
            howLikeToApply: draftGig.howLikeToApply,
            workSamples: draftGig.workSamples,
            jobImage: draftGig.jobImage,
            lastDateForApply: draftGig.lastDateForApply,
            category: draftGig.category,
            isApproved: draftGig.isApproved,
            minAge: draftGig.minAge,
            maxAge: draftGig.maxAge,
            instaMin: draftGig.instaMin,
            instaMax: draftGig.instaMax,
            tikTokMin: draftGig.tikTokMin,
            tikTokMax: draftGig.tikTokMax,
            linkedInMin: draftGig.linkedInMin,
            linkedInMax: draftGig.linkedInMax,
            fbMin: draftGig.fbMin,
            fbMax: draftGig.fbMax,
            twitterMin: draftGig.twitterMin,
            twitterMax: draftGig.twitterMax,
            youTubeMin: draftGig.youTubeMin,
            youTubeMax: draftGig.youTubeMax,
            status: draftGig.status,
            isActive: true,
            adminApproved: true,
            type: "Posted"
        });

        // Save the new gig to the database
        const savedGig = await newGig.save();

        // Update the draft gig's isActive field to false
        await draftmodel.findOneAndUpdate({ _id: gigId }, { isActive: false });
        // Find active jobs by brandId
        const jobs = await gigsmodel.find({ brandId: draftGig.brandId, isActive: true });


        // Generate job listings HTML
        const jobListings = jobs.map(job => `
      <div>
          <h3><a href=https://brandsandtalent.com/link?jobId=${job._id}">${job.jobTitle}</a></h3>
          <p><strong>Active Job:</strong> ${job.jobTitle}</p>
          <p><strong>Location:</strong> ${job.jobLocation}</p>
          <p>${job.jobDescription.slice(0, 100)}...</p>
      </div>
  `).join('<hr>');

        // Create email content
        const emailContent = `
      <html>
          <body>
              <h1>Active Job Alerts</h1>
              ${jobListings}
          </body>
      </html>
  `;

        //thusrday
        // Send notifications and save them to the notification table
        const jobalert = `
        <html>
          <body>
            <p>Reminder: The application deadline for <strong>${savedGig.jobTitle}</strong> in <strong>${savedGig.jobLocation}</strong> is approaching.</p>
          </body>
        </html>
      `;
      
        const kids = await kidsmodel.find({
            isActive: true,
            inActive: true,
            isSubscribed: true,
            relevantCategories: { $in: [savedGig.category] }
        });

        // const kids = await kidsmodel.find({ isActive: true,inActive:true });
        for (const kid of kids) {
            await sendNotifications(kid.fcmToken, 'Job Application Reminder', jobalert);
            await saveNotification(savedGig.brandId, kid._id, savedGig._id, jobalert);

            await sendEmail(kid.parentEmail, 'Job Application Reminder', emailContent);
        }

        // Send notifications for adults
        const adults = await adultmodel.find({
            isActive: true,
            inActive: true,
            isSubscribed: true,
            relevantCategories: { $in: [savedGig.category] }
        });
        //const adults = await adultmodel.find({ isActive: true,inActive:true });
        for (const adult of adults) {
            await sendNotifications(adult.fcmToken, 'Job Application Reminder', jobalert);
            await saveNotification(savedGig.brandId, adult._id, savedGig._id, jobalert);

            await sendEmail(adult.adultEmail, 'Job Application Reminder', emailContent);
        }

        // Send success response with saved gig data
        return res.status(201).json({
            status: true,
            message: "Draft Added and Notifications Sent Successfully",
            data: savedGig,
        });

    } catch (error) {
        // Log the error and send a 500 internal server error response

        return res.status(500).json({
            status: false,
            message: 'Server error'
        });
    }
};

/**
 *********editDraft*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const editDraft = async (req, res) => {
    try {
        const gigId = req.body.gigId || req.params.gigId;

        // Extract fields from the request body
        const {
            jobTitle, jobLocation, streetAddress, employmentType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage, brandImage, country, state, city, jobPostedDate, lastDateForApply, category,
            minAge, maxAge, instaMin, instaMax, tikTokMin, tikTokMax, linkedInMin, linkedInMax, fbMin, fbMax, twitterMin, twitterMax,
            youTubeMin, youTubeMax

        } = req.body;

        // Construct update object
        const updateFields = {
            jobTitle, jobLocation, streetAddress, employmentType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage, brandImage, country, state, city, jobPostedDate, lastDateForApply, category,
            minAge, maxAge, instaMin, instaMax, tikTokMin, tikTokMax, linkedInMin, linkedInMax, fbMin, fbMax, twitterMin, twitterMax,
            youTubeMin, youTubeMax

        };

        // Update the draft document
        const updatedDraft = await draftmodel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(gigId) },
            updateFields,
            { new: true } // Return the updated document
        );

        if (!updatedDraft) {
            return res.status(200).json({
                status: false,
                message: "Draft not found"
            });
        }

        // Return the updated data in the response
        res.json({
            status: true,
            message: "Updated successfully",
            data: updatedDraft
        });
    } catch (error) {

        res.status(500).json({
            status: false,
            message: 'Server error'
        });
    }
};


/**
*********editJob*****
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const editJob = async (req, res) => {
    try {
        const gigId = req.body.gigId || req.params.gigId; // Ensure you get gigId from the request

        // Construct the updateFields object directly from the request body
        const {
            jobTitle, jobLocation, streetAddress, employmentType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage, brandImage, country, state, city, jobPostedDate, lastDateForApply, category,
            minAge, maxAge, instaMin, instaMax, tikTokMin, tikTokMax, linkedInMin, linkedInMax, fbMin, fbMax, twitterMin, twitterMax,
            youTubeMin, youTubeMax
            // isActive: true if needed
        } = req.body;

        // Use a plain object for the fields to be updated
        const updateFields = {
            jobTitle, jobLocation, streetAddress, employmentType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage, brandImage, country, state, city, jobPostedDate, lastDateForApply, category,
            minAge, maxAge, instaMin, instaMax, tikTokMin, tikTokMax, linkedInMin, linkedInMax, fbMin, fbMax, twitterMin, twitterMax,
            youTubeMin, youTubeMax
            // Include isActive: true if updating this field as well
        };

        // Perform the update
        const updateResult = await gigsmodel.updateOne(
            { _id: new mongoose.Types.ObjectId(gigId) },
            { $set: updateFields }
        );

        if (updateResult.modifiedCount === 0) {
            // If no documents were modified, it means the gigId didn't match any documents
            return res.json({ status: false, message: 'No changes were made or job not found.' });
        }

        // Assuming you want to return the updated document, you should use findOneAndUpdate with the { new: true } option
        const updatedJob = await gigsmodel.findOne({ _id: new mongoose.Types.ObjectId(gigId) });

        res.json({
            message: "Updated successfully",
            status: true,
            data: updatedJob // Return the updated document
        });
    } catch (err) {

        res.status(500).json({ status: false, message: 'Error Occurred' });
    }
};


/**
*********get brand job by id******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getBrandDraftJobsByID = async (req, res, next) => {
    try {
        const brandId = req.body.brandId || req.params.brandId;

        /* Authentication (Uncomment and adjust as necessary)
        const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
        if (!authResult) {
          return res.status(401).json({ status: false, msg: 'Authentication failed' });
        }
        */
        const today = new Date();
        // Since we're using async/await, there's no need to use .then() and .catch() here.
        const gigs = await draftmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true, lastDateForApply: { $gte: today } }).sort({ created: -1 });

        if (gigs.length === 0) {
            // If no gigs are found, send an empty array in the response
            return res.json({
                status: true,
                data: [] // Return an empty array for data
            });
        }

        // If gigs are found, send them back in the response
        res.json({
            status: true,
            data: gigs // Note: gigs is already an array, so no need for [gigs]
        });

    } catch (error) {
        // Log the error and send a 500 internal server error response

        res.status(500).json({
            status: false,
            message: 'Server error'
        });
    }
};


/**
*********get brand posted job by id******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getBrandPostedJobsByID = async (req, res, next) => {
    try {
        const brandId = req.body.brandId || req.params.brandId;

        // // Authentication (Uncomment and adjust as necessary)
        // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
        // if (!authResult) {
        //   return res.status(401).json({ status: false, msg: 'Authentication failed' });
        // }
        const today = new Date();

        // Since we're using async/await, there's no need to use .then() and .catch() here.
        const gigs = await gigsmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true, lastDateForApply: { $gte: today }, adminApproved: true }).sort({ created: -1 });

        if (gigs.length === 0) {
            // If no gigs are found, send an empty array in the response
            return res.json({
                status: true,
                data: [] // Return an empty array for data
            });
        }
        gigs.reverse();
        // If gigs are found, send them back in the response as an array of objects
        res.json({
            status: true,
            data: gigs // No need to encapsulate gigs within an array
        });

    } catch (error) {
        // Log the error and send a 500 internal server error response

        res.status(500).json({
            status: false,
            message: 'Server error'
        });
    }
};



/**
********getAllJobs***
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getAllJobs = async (req, res, next) => {
    try {
        const userId = req.body.userId || req.params.userId;


        const today = new Date();


        const gigs = await gigsmodel.find({
            brandId: new mongoose.Types.ObjectId(userId),
            isActive: true,
            lastDateForApply: { $gte: today },
            adminApproved: true,
        }).sort({ createdAt: -1 });
        console.log("gigs", gigs)


        const drafts = await draftmodel.find({
            brandId: new mongoose.Types.ObjectId(userId),
            isActive: true,
            //  adminApproved:true,
            lastDateForApply: { $gte: today }
        }).sort({ createdAt: -1 });
        console.log("drafts", drafts)

        // Combine gigs and drafts into a single array and sort them by creation date, newest first
        const jobs = [...gigs, ...drafts].sort((a, b) => b.createdAt - a.createdAt);
        //const jobs = [...gigs].sort((a, b) => b.createdAt - a.createdAt);
        res.json({
            status: true,
            data: jobs
        });
    } catch (error) {

        res.status(500).json({
            status: false,
            error: error.message
        });
    }
};




/**
 *  Function for Delete  job
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const deleteJob = async (req, res, next) => {
    try {
        const gigId = req.body.gigId; // Extract gigId from request body
        const type = req.body.type; // Extract type from request body

        let Model;
        if (type === 'Posted') {
            Model = gigsmodel;
        } else if (type === 'Draft') {
            Model = draftmodel;
        } else {
            return res.json({
                status: false,
                message: 'Invalid type'
            });
        }

        // Find the job based on gigId and type
        const job = await Model.findOne({ _id: gigId, isActive: true });

        // Check if job exists
        if (!job) {
            return res.json({
                status: false,
                message: 'Job not found'
            });
        }

        // Update the document to set isActive to false
        const updatedJob = await Model.findOneAndUpdate(
            { _id: gigId },
            { isActive: false },
            { new: true } // Return the updated document
        );

        // Also update gigDetails.isActive to false in favouritemodel
        await favouritesgigsmodel.updateMany(
            { gigId: gigId },
            { 'gigDetails.isActive': false }
        );


        // If successful, send success response
        res.json({
            status: true,
            message: 'Deleted Successfully',
            response: updatedJob
        });
    } catch (error) {
        // If an error occurs, send error response

        res.status(500).json({
            status: false,
            message: 'An error occurred'
        });
    }
};

/**
********getAnyJobsById***
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getAnyJobById = async (req, res, next) => {
    try {
        // Assuming gigId comes from the request (either from body or params)
        const gigId = req.body.gigId || req.params.gigId;

        if (!mongoose.Types.ObjectId.isValid(gigId)) {
            return res.status(400).json({ status: false, msg: 'Invalid ID format' });
        }

        // First, try to find the job in gigsmodel
        let job = await gigsmodel.findById({ _id: gigId, isActive: true, adminApproved: true }).sort({ createdAt: -1 });

        // If not found in gigsmodel, try to find it in draftmodel
        if (!job) {
            job = await draftmodel.findById({ _id: gigId, isActive: true }).sort({ createdAt: -1 });
        }

        // If the job is not found in both models
        if (!job) {
            return res.status(200).json({ status: false, msg: 'Job not found' });
        }

        console.log("gigId", gigId)
        // Check if the job is applied by the user
        const application = await applymodel.findOne({ gigId: gigId });
        console.log("application", application)
        if (application) {
            job = job.toObject(); // Convert to plain object to modify
            job.isApplied = "Applied"; // Add isApplied field to indicate the job is applied by the user
        } else {
            console.log("tsetjsjkcfkvb")
            job.isApplied = 'Apply Now'; // Add isApplied field to indicate the job is not applied by the user
        }

        // Job found, return it
        res.json({
            status: true,
            data: job
        });
    } catch (error) {
        res.json({
            status: false,
            error: error.message
        });
    }
};



/********** job count******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const jobCount = async (req, res, next) => {
    try {
        // Extracting brandId from the request body or parameters
        const brandId = req.body.brandId || req.params.brandId;

        if (!brandId) {
            return res.status(400).json({ status: false, message: "No brandId provided" });
        }

        // Use countDocuments for a more direct and efficient counting
        const draftCount = await draftmodel.countDocuments({
            brandId: new mongoose.Types.ObjectId(brandId),
            adminApproved: true,
            isActive: true
        });

        const postJobCount = await gigsmodel.countDocuments({
            brandId: new mongoose.Types.ObjectId(brandId),
            isActive: true,
            adminApproved: true
        });

        // Calculate the total count of drafts and post jobs
        const CampaignCount = draftCount + postJobCount;

        // Retrieve the current brandsmodel document
        let brand = await brandsmodel.findOne({ _id: new mongoose.Types.ObjectId(brandId) });

        if (!brand) {
            return res.status(200).json({ status: false, message: "Brand not found" });
        }

        // Update the draftCount, postJobCount, and totalCampaignCount fields
        brand.draftCount = draftCount;
        brand.postJobCount = postJobCount;
        brand.campaignCount = CampaignCount;

        // Save the updated brand document
        await brand.save();

        // Push the counts into an array
        const countsArray = [
            { type: "drafts", count: draftCount },
            { type: "postJobs", count: postJobCount },
            { type: "totalCampaigns", count: CampaignCount }
        ];

        res.json({
            status: true,
            message: "Counts updated successfully",
            data: countsArray
        });
    } catch (error) {

        res.json({
            status: false,
            message: "Error updating counts"
        });
    }
};

/**
*********searchJobs******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const searchJobs = async (req, res, next) => {
    try {
        // Extract search parameters from request body
        const { jobTitle, country, jobLocation, compensation, skills, keyword, jobType, employmentType, talentId, category, state, city } = req.body;
        // Define the fields to search in
        const searchableFields = [
            'jobTitle',
            'country',
            'state',
            'city',
            'streetAddress',
            'employmentType',
            'jobDescription',
            'skills',
            'additionalRequirements',
            'compensation',
            'gender',
            'nationality',
            'languages',
            'benefits',
            'compensation',
            'jobType',
            'jobCurrency',
            'minPay',
            'maxPay',
            'hiringCompany',
            'product',
            'productDescription',
            'hiringCompanyDescription',
            'howLikeToApply',
            'category',

        ];

        // Build query criteria using the $or operator
        let queryConditions = [];
        if (keyword) {
            queryConditions = searchableFields.map(field => ({
                [field]: { $regex: new RegExp(keyword, 'i') }
            }));
        }
        if (country) {
            queryConditions.push({ country: { $regex: new RegExp(country, 'i') } });
        }
        if (state) {
            queryConditions.push({ state: { $regex: new RegExp(state, 'i') } });
        }
        if (city) {
            queryConditions.push({ city: { $regex: new RegExp(city, 'i') } });
        }
        if (category) {
            queryConditions.push({ category: { $regex: new RegExp(category, 'i') } });
        }
        if (jobTitle) {
            queryConditions.push({ jobTitle: { $regex: new RegExp(jobTitle, 'i') } }); // Case-insensitive search for jobTitle
        }
        if (jobType) {
            queryConditions.push({ jobType: { $regex: new RegExp(jobType, 'i') } }); // Case-insensitive search for jobType
        }
        if (employmentType) {
            queryConditions.push({ employmentType: { $regex: new RegExp(employmentType, 'i') } }); // Case-insensitive search for workplaceType
        }
        if (jobLocation) {
            queryConditions.push({ jobLocation: { $regex: new RegExp(jobLocation, 'i') } }); // Case-insensitive search for jobLocation
        }

       
        const compensationConditions = [];

        if (compensation) {
            if (compensation === 'Paid Collaboration') {
                compensationConditions.push({ 'compensation.paid_collaboration': { $exists: true } });
            }
            if (compensation === 'Paid Collaboration + Product/Gift') {
                compensationConditions.push({ 'compensation.paid_collaboration_and_gift': { $exists: true } });
            }
            if (compensation === 'Product/ Gift') {
                compensationConditions.push({ 'compensation.product_gift': { $exists: true } });
            }

            if (compensationConditions.length > 0) {
                queryConditions.push({ $or: compensationConditions });
            }
        }

        //neww


        if (skills && skills.length > 0) {
            // Convert each skill to a case-insensitive regex pattern
            const skillRegexPatterns = skills.map(skill => new RegExp(skill, 'i'));
            queryConditions.push({ skills: { $in: skillRegexPatterns } });
        }

        let queryCriteria = { isActive: true };
        if (queryConditions.length > 0) {
            queryCriteria.$and = queryConditions;

        }

        // Find matching gigs
        const gigs = await gigsmodel.find(queryCriteria).sort({ created: -1 });
        console.log("gigis", gigs)

        // Create modified data with an "isApplied" status
        const modifiedData = await Promise.all(gigs.map(async (gig) => {
            const application = await notificationmodel.findOne({ gigId: gig._id, talentId: talentId });
            console.log("applicationtestimggggg", application)
            return {
                ...gig._doc,
                isApplied: application ? "Applied" : "Apply Now"
            };
        }));

        // Send response
        res.json({
            status: true,
            data: modifiedData
        });
    } catch (error) {
        // Handle errors

        res.status(500).json({
            status: false,
            msg: 'Failed to search jobs'
        });
    }
};



/**
*********applyjobs******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const applyJobs = async (req, res, next) => {
    const { talentId, brandId, gigId } = req.body;

    try {
        // Find talent and brand
        const talent = await findUserById(talentId);
        const brand = await findUserById(brandId);

        if (!talent || !brand) {
            return res.status(200).json({ status: false, msg: 'Talent or Brand not found' });
        }

        // Determine the correct model based on the talent type
        const talentType = await determineUserType(talentId);
        if (!talentType) {
            return res.status(200).json({ status: false, msg: 'User type not found for talent' });
        }

        const TalentModel = talentType === 'kids' ? kidsmodel : adultmodel;
        const updateTalentApplications = async (talentId, gigId, brandId) => {
            try {
                await TalentModel.findByIdAndUpdate(
                    talentId,
                    {
                        $set: { isApplied: true },
                        $push: {
                            applications: {
                                gigId: gigId,
                                isApplied: true,
                                brandId: brandId,
                            },
                        },
                    },
                    { new: true }
                );
            } catch (error) {
                console.error("Error updating applications:", error);
            }
        };

        await TalentModel.findByIdAndUpdate(talentId, {
            $set: { isApplied: true },
            $push: {
                applications: {
                    gigId: gigId,
                    isApplied: true,
                    brandId: brandId
                },

            },
            // gigId: gigId,
            //     brandId: brandId
        });

        // // Update the talent document with the application details
        await TalentModel.findByIdAndUpdate(talentId, { $set: { gigId: gigId, isApplied: true, brandId: brandId } });

        //  Notification content
        const brandNotificationMessage = `A talent has applied for a job`;//gig ${gigId}
        const talentNotificationMessage = 'You have successfully applied for the job';

        // Save a single notification in the database for both brand and talent
        await saveNotifications(brandId, talentId, gigId, brandNotificationMessage, talentNotificationMessage);
        await saveApplyJobs(brandId, talentId, gigId);
       
        res.json({ status: true, msg: 'Application processed' });
    } catch (error) {

        res.status(500).json({ status: false, msg: error.message });
    }
};
// Helper function to find a user by their ID
async function findUserById(userId) {
    try {
        const brand = await brandsmodel.findOne({ _id: userId, isActive: true, inActive: true });
        if (brand) return brand;

        const kidTalent = await kidsmodel.findOne({ _id: userId, inActive: true, isActive: true });
        if (kidTalent) return kidTalent;

        const adultTalent = await adultmodel.findOne({ _id: userId, inActive: true, isActive: true });
        if (adultTalent) return adultTalent;

        return null;
    } catch (error) {

        return null;
    }
}

// Helper function to determine the user type based on their ID
async function determineUserType(userId) {
    const isBrand = await brandsmodel.exists({ _id: userId });
    if (isBrand) return 'brand';

    const isKid = await kidsmodel.exists({ _id: userId });
    if (isKid) return 'kids';

    const isAdult = await adultmodel.exists({ _id: userId });
    if (isAdult) return 'adult';

    return null;
}

// Helper function to send a notification
const sendNotification = async (fcmToken, title, text) => {
    if (!fcmToken) {

        return;
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
    } catch (error) {
        console.error("Error sending notification", error.response ? error.response.data : error.message);
        throw error;  // Let the calling function handle the error
    }
};
//Adjusted helper function to save a single notification
async function saveNotifications(brandId, talentId, gigId, brandNotificationMessage, talentNotificationMessage) {
    try {
        // Fetch details of brand, talent, and gig
        const brand = await findUserById(brandId);
        const talent = await findUserById(talentId);
        const gig = await gigsmodel.findById(gigId); // Replace GigModel with your actual model for gigs

        // Determine user types for brand and talent
        const brandType = await determineUserType(brandId);
        const talentType = await determineUserType(talentId);

        // Create the notification document
        const notification = new notificationmodel({
            notificationType: 'Job Application',
            brandId: brandId,
            talentId: talentId,
            gigId: gigId,
            brandNotificationMessage: brandNotificationMessage,
            talentNotificationMessage: talentNotificationMessage,
            userType: talentType, // Use talent's user type for the notification
            brandDetails: {
                _id: brandId,
                brandName: brand.brandName,
                brandEmail: brand.brandEmail,
                logo: brand.logo,
                brandImage: brand.brandImage,
                brandPhone: brand.brandPhone,
                // Add other brand details as needed
            },
            talentDetails: {
                _id: talentId,
                parentFirstName: talent.parentFirstName,
                parentLastName: talent.parentLastName,
                parentEmail: talent.parentEmail || talent.adultEmail,
                childFirstName: talent.childFirstName,
                childLastName: talent.childLastName,
                preferredChildFirstname: talent.preferredChildFirstname,
                preferredChildLastName: talent.preferredChildLastName,
                image: talent.image,
                publicUrl: talent.publicUrl,
                profession: talent.profession,
                relevantCategories: talent.relevantCategories,
                childGender: talent.childGender,
                maritalStatus: talent.maritalStatus,
                childNationality: talent.childNationality,
                childEthnicity: talent.childEthnicity,
                languages: talent.languages,
                childDob: talent.childDob,
                childLocation: talent.childLocation,
                childCity: talent.childCity,
                childAboutYou: talent.childAboutYou,
                cv: talent.cv,
            
                features: talent.features,
                portfolio: talent.portfolio,
                verificationId: talent.verificationId,
                idType: talent.idType,
                bodyType: talent.bodyType,
                industry: talent.industry,
                isFavorite: talent.isFavorite,
                bookJob: talent.bookJob,
                rating: talent.rating,
                image: talent.image,
                services: talent.services,
                reviews: talent.reviews,
                maritalStatus: talent.maritalStatus,
                age: talent.age,
                profileStatus: talent.profileStatus,
                applications: talent.applications,
            
                noOfJobsCompleted: talent.noOfJobsCompleted,
                averageStarRatings: talent.averageStarRatings,
                planName: talent.planName,
                videoList: talent.videoList,
                audioList: talent.audioList
                // Add other talent details as needed
            },
            gigDetails: {
                jobTitle: gig.jobTitle,
                category: gig.category,
                minAge: gig.minAge,
                maxAge: gig.maxAge,
                instaMin: gig.instaMin,
                instaMax: gig.instaMax,
                tikTokMin: gig.tikTokMin,
                tikTokMax: gig.tikTokMax,
                linkedInMin: gig.linkedInMin,
                linkedInMax: gig.linkedInMax,
                fbMin: gig.fbMin,
                fbMax: gig.fbMax,
                twitterMin: gig.twitterMin,
                twitterMax: gig.twitterMax,
                youTubeMin: gig.youTubeMin,
                youTubeMax: gig.youTubeMax

            }
        });

        // Save the notification document
        const savedNotification = await notification.save();

    } catch (error) {
        console.error("Error saving notification:", error);
    }
}
async function saveApplyJobs(brandId, talentId, gigId) {
    try {

        // Fetch details of brand, talent, and gig
        const brand = await findUserById(brandId);
        const talent = await findUserById(talentId);
        const gig = await gigsmodel.findById(gigId); // Replace GigModel with your actual model for gigs

        // Determine user types for brand and talent
        const brandType = await determineUserType(brandId);
        const talentType = await determineUserType(talentId);

        // Create the notification document
        const apply = new applymodel({

            brandId: brandId,
            talentId: talentId,
            gigId: gigId,
            isApplied: "Applied",
            type: talentType, // Use talent's user type for the notification
            brandDetails: {
                _id: brand._id,
                brandName: brand.brandName,
                brandEmail: brand.brandEmail,
                logo: brand.logo,
                brandImage: brand.brandImage,
                brandPhone: brand.brandPhone,
                // Add other brand details as needed
            },
            talentDetails: {
                _id: talent._id,
                parentFirstName: talent.parentFirstName,
                parentLastName: talent.parentLastName,
                parentEmail: talent.parentEmail,
                childFirstName: talent.childFirstName,
                childLastName: talent.childLastName,
                preferredChildFirstname: talent.preferredChildFirstname,
                preferredChildLastName: talent.preferredChildLastName,
                image: talent.image,
                childGender: talent.childGender,
                maritalStatus: talent.maritalStatus,
                childNationality: talent.childNationality,
                languages: talent.languages,
                childDob: talent.childDob,
                childPhone: talent.childPhone,
                userType: talent.userType,
                isFavorite: talent.isFavourite,
                adultEmail: talent.adultEmail,
                parentMobileNo: talent.parentMobileNo,


                // Add other talent details as needed
            },
            gigDetails: {
                jobTitle: gig.jobTitle,
                jobLocation: gig.jobLocation,
                streetAddress: gig.streetAddress,
                employmentType: gig.employmentType,
                jobType: gig.jobType,
                jobDescription: gig.jobDescription,
                skills: gig.skills,
                additionalRequirements: gig.additionalRequirements,
                languages: gig.languages,
                hiringCompany: gig.hiringCompany,
                jobImage: gig.jobImage,
                category: gig.category
                
            }
        });

        // Save the notification document
        const savedjobs = await apply.save();

    } catch (error) {
        console.error("Error saving notification:", error);
    }
}




/**
 *********read Notification*****
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const readNotification = async (req, res) => {
    try {
        const notificationId = req.body.notificationId || req.params.notificationId;

        // Ensure the notification ID is provided
        if (!notificationId) {
            return res.status(400).json({ status: false, msg: "Notification ID is required" });
        }

        try {
            await notificationmodel.updateOne(
                { _id: new mongoose.Types.ObjectId(notificationId) },
                { $set: { read: true } }
            );
            res.json({ status: true, msg: 'Notification marked as read successfully' });
        } catch (err) {
            res.status(500).json({ status: false, msg: err.message });
        }
    } catch (err) {
        res.status(500).json({ status: false, msg: err.message });
    }
};

/**
********getBrandNotification***
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getBrandNotification = async (req, res, next) => {
    try {
        const brandId = req.body.brandId || req.params.brandId;

        if (!brandId) {
            return res.status(400).json({
                status: false,
                msg: 'Brand ID is required'
            });
        }


        // Fetch all active notifications for the specified brandId
        const notifications = await notificationmodel.find({
            brandId: new mongoose.Types.ObjectId(brandId),
            isActive: true
        }).sort({ createdAt: -1 });

        // You could uncomment and modify this if you have a draft model to fetch drafts as well
        // const drafts = await draftmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true }).sort({ createdAt: -1 });

        res.json({
            status: true,
            data: notifications
        });
    } catch (error) {

        res.status(500).json({
            status: false,
            msg: 'Failed to fetch notifications',
            error: error.message
        });
    }
};
/**
********get Talent notifications***
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getTalentNotification = async (req, res, next) => {
    try {
        const talentId = req.body.talentId || req.params.talentId;

        if (!talentId) {
            return res.status(400).json({
                status: false,
                msg: 'talent ID is required'
            });
        }


        // Fetch all active notifications for the specified brandId
        const notifications = await notificationmodel.find({
            talentId: new mongoose.Types.ObjectId(talentId),
            isActive: true
        }).sort({ createdAt: -1 });

        // You could uncomment and modify this if you have a draft model to fetch drafts as well
        // const drafts = await draftmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true }).sort({ createdAt: -1 });

        res.json({
            status: true,
            data: notifications
        });
    } catch (error) {

        res.status(500).json({
            status: false,
            msg: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

/**
 * Get count notifications
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const getCountNotification = async (req, res, next) => {
    try {
        const talentId = req.body.userId
        const brandId = req.body.userId; // This can be added if you want to fetch by brandId as well.

        if (!talentId && !brandId) {
            return res.status(400).json({
                status: false,
                msg: 'talent ID or brand ID is required'
            });
        }

        let query = {};
        if (talentId) {
            query = { talentId: new mongoose.Types.ObjectId(talentId), isActive: true };
        } else if (brandId) {
            query = { brandId: new mongoose.Types.ObjectId(brandId), isActive: true };
        }

        // Fetch all active notifications for the specified ID
        const notifications = await notificationmodel.find(query).sort({ createdAt: -1 });

        // Count unread notifications
        const unreadCount = await notificationmodel.countDocuments({
            ...query,
            read: false
        });

        res.json({
            status: true,
            data: notifications,
            unreadCount: unreadCount
        });
    } catch (error) {

        res.status(500).json({
            status: false,
            msg: 'Failed to fetch notifications',
            error: error.message
        });
    }
};
/**
 * Get Appliedjobs
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const getAppliedjobs = async (req, res, next) => {
    try {
        const userId = req.body.userId;

        // First, attempt to find the user and their applications in kidsmodel
        let user = await kidsmodel.findOne({ _id: userId, isActive: true, inActive: true });

        if (!user) {
            // If no entry in kidsmodel, try adultmodel
            user = await adultmodel.findOne({ _id: userId, isActive: true, inActive: true });
        }

        if (!user || !user.applications || user.applications.length === 0) {
            return res.status(200).json({
                status: false,
                message: 'No applications found'
            });
        }

        // Map the gigIds from the applications array
        const gigIds = user.applications.map(application => application.gigId);

        // Fetch all gig details using gigIds
        const gigDetails = await Promise.all(
            gigIds.map(gigId => gigsmodel.findById(gigId))
        );

        // Filter out any null responses (in case some gigs were not found)
        const validGigDetails = gigDetails.filter(detail => detail !== null);

        // Sort validGigDetails by createdAt property in descending order
        validGigDetails.sort((a, b) => b.createdAt - a.createdAt);

        if (validGigDetails.length === 0) {
            return res.status(200).json({
                status: false,
                message: 'Gig details not found'
            });
        }

        res.json({
            status: true,
            data: validGigDetails
        });

    } catch (error) {

        res.status(500).json({
            status: false,
            message: 'Server error'
        });
    }
};

/**
 * selectedLevelRange
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

const selectedLevelRange = async (req, res, next) => {
    try {
        const { talentId, selectedLevel, gigId } = req.body;

        // Validation for required parameters
        if (!talentId || !selectedLevel || !gigId) {
            return res.status(400).json({
                status: false,
                message: 'talentId and selectedLevel are required'
            });
        }

        // Attempt to find and update the talent in kidsmodel or adultmodel
        let updated = false;
        const kids = await kidsmodel.findOne({ _id: talentId, isActive: true, inActive: true });
        if (kids) {
            await kidsmodel.findOneAndUpdate(
                { _id: talentId, "applications.gigId": gigId },
                { $set: { "applications.$.selectedLevel": selectedLevel } }
            );
            updated = true;
        }

        const adult = await adultmodel.findOne({ _id: talentId, isActive: true, inActive: true });
        if (adult) {
            await adultmodel.findOneAndUpdate(
                { _id: talentId, "applications.gigId": gigId },
                { $set: { "applications.$.selectedLevel": selectedLevel } }
            );
            updated = true;
        }

        // Always update the applymodel regardless of kids/adult record existence
        await applymodel.updateMany({ talentId, gigId }, { selectedLevel });

        if (updated) {
            return res.json({
                status: true,
                message: 'Selected level updated successfully'
            });
        } else {
            // If no kids or adults were found and updated, still return success for applymodel update
            return res.json({
                status: true,
                message: 'Selected level updated in applications, but no corresponding kids or adults record found'
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};



/**
 * Inform selected level
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const informSelectedLevel = async (req, res) => {
    try {
        const { talentId, selectedLevel } = req.body;

        if (!talentId || !selectedLevel) {
            return res.status(400).json({
                status: false,
                message: 'talentId and selectedLevel are required'
            });
        }

        // Find the talent and decide the recipient email based on whether they are a kid or an adult
        const kid = await kidsmodel.findOne({ _id: talentId, isActive: true, inActive: true }).select('childEmail parentEmail fcmToken parentFirstName parentLastName childFirstName childLastName preferredChildFirstname preferredChildLastName image');
        const adult = await adultmodel.findOne({ _id: talentId, isActive: true, inActive: true }).select('adultEmail contactEmail fcmToken firstName lastName image');

        let emails = [];
        let fcmToken;
        let talentDetails = {};
        if (kid) {
            emails.push(kid.childEmail, kid.parentEmail);
            fcmToken = kid.fcmToken;
            talentDetails = {
                parentFirstName: kid.parentFirstName,
                parentLastName: kid.parentLastName,
                parentEmail: kid.parentEmail,
                childFirstName: kid.childFirstName,
                childLastName: kid.childLastName,
                preferredChildFirstname: kid.preferredChildFirstname,
                preferredChildLastName: kid.preferredChildLastName,
                image: kid.image
            };
        } else if (adult) {
            emails.push(adult.adultEmail, adult.contactEmail);
            fcmToken = adult.fcmToken;
            talentDetails = {
                firstName: adult.firstName,
                lastName: adult.lastName,
                email: adult.adultEmail,
                image: adult.image
            };
        } else {
            return res.status(200).json({
                status: false,
                message: 'No active talent found with the provided talentId'
            });
        }

        // Setup the nodemailer transporter
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: host,
                pass: pass
            }

        });

       
        const mailOptions = {
            from: host,
            to: emails.join(', '), // Sends to all collected emails
            subject: 'Talent Notification',
            text: 'Hai,' + (req.body.officeAddress || '')
        };

        // Notification title and message
        let notificationTitle = 'Selected Range Notification';
        let notificationMessage = '';

        // Modify email content and subject based on selectedLevel
        switch (selectedLevel) {
            case 'bookedCandidates':
                mailOptions.subject = 'Congratulations, You Have Been Selected!';
                mailOptions.text += ' You have been selected.';
                notificationTitle = 'Congratulations!';
                notificationMessage = 'You have been selected.';
                break;
            case 'shortlistedCandidates':
                mailOptions.subject = 'Congratulations, You Have Been Shortlisted!';
                mailOptions.text += ' You have been shortlisted for the next stage.';
                notificationTitle = 'Congratulations!';
                notificationMessage = 'You have been shortlisted for the next stage.';
                break;
            case 'rejectedCandidates':
                mailOptions.subject = 'Regret, You Have Been Rejected';
                mailOptions.text += ' We regret to inform you that you were not selected.';
                notificationTitle = 'Application Update';
                notificationMessage = 'We regret to inform you that you were not selected.';
                break;

            case 'interviewInvitations':
                mailOptions.subject = 'Interview Invitation';
                mailOptions.text = req.body.officeAddress || '';
                notificationTitle = 'Interview Invitation';
                notificationMessage = `You have been invited to a interview.`;

                break;
            default:
                return res.status(400).json({
                    status: false,
                    message: 'Invalid selectedLevel value'
                });
        }

        // Send the email
        await transporter.sendMail(mailOptions);

        // Send the notification
        if (fcmToken) {
            await sendNotificatio(fcmToken, notificationTitle, notificationMessage);
        }

        // Save the notification
        const notification = new notificationmodel({
            notificationType: selectedLevel,
            talentId: talentId,
            talentNotificationMessage: notificationMessage,
            talentDetails: talentDetails
        });

        const savedNotification = await notification.save();

        // Respond with success if the email and notification were sent successfully
        res.json({
            status: true,
            message: 'Email and notification sent and saved successfully',
            notification: savedNotification
        });

    } catch (error) {

        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};


/**
 * NewCandidates
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const newCandidates = async (req, res) => {
    try {
        const { brandId } = req.body;

        // Validate input
        if (!brandId) {
            return res.status(400).json({
                status: false,
                message: 'Invalid or missing Brand ID',
            });
        }

        // Fetching jobs applications for a specific brand
        const applyJobs = await applymodel.find({
            brandId: brandId,
            isActive: true
        });

        // Return the fetched data
        return res.json({
            status: true,
            message: 'Data retrieved successfully',
            data: applyJobs
        });

    } catch (error) {
        // Handle errors that occur during the fetch operation

        return res.status(500).json({
            status: false,
            message: 'Failed to retrieve data',
        });
    }
};


/**
 * getSelectionList
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const getSelectionList = async (req, res) => {
    try {
        const { brandId, selectedLevel } = req.body;

        // Validate input
        if (!brandId || !selectedLevel) {
            return res.status(400).json({
                status: false,
                message: 'Invalid or missing Brand ID or Selected Level',
            });
        }

        // Find all talents that have applied to jobs with the given brandId and selectedLevel
        const talents = await applymodel.find({
            brandId: new mongoose.Types.ObjectId(brandId),
            selectedLevel: selectedLevel.trim(),
        });


        if (!talents || talents.length === 0) {
            return res.status(200).json({
                status: false,
                message: 'No talents found for the provided brandId and selectedLevel',
                data: []
            });
        }

        // Return the fetched data
        return res.json({
            status: true,
            message: 'Data retrieved successfully',
            data: talents
        });

    } catch (error) {
        // Handle errors that occur during the fetch operation

        return res.status(500).json({
            status: false,
            message: 'Failed to retrieve data',
        });
    }
};
/*
 * updateFavouriteJobs
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const updateFavouriteJobs = async (req, res, next) => {
    const { talentId, brandId, gigId } = req.body;

    try {
        // Find talent and brand
        const talent = await findUserById(talentId);
        const brand = await findUserById(brandId);

        if (!talent || !brand) {
            return res.status(200).json({ status: false, msg: 'Talent or Brand not found' });
        }

        // Determine the correct model based on the talent type
        const talentType = await determineUserType(talentId);
        if (!talentType) {
            return res.status(200).json({ status: false, msg: 'User type not found for talent' });
        }

        const TalentModel = talentType === 'kids' ? kidsmodel : adultmodel;
        await savematchedJobs(gigId)
        await saveFavouritesJobs(brandId, talentId, gigId);

        res.json({ status: true, msg: 'Favourites Update Successfully' });
    } catch (error) {

        res.status(500).json({ status: false, msg: error.message });
    }
};

// Helper function to find a user by their ID
async function findUserById(userId) {
    try {
        const brand = await brandsmodel.findOne({ _id: userId, isActive: true, inActive: true });
        if (brand) return brand;

        const kidTalent = await kidsmodel.findOne({ _id: userId, isActive: true, inActive: true });
        if (kidTalent) return kidTalent;

        const adultTalent = await adultmodel.findOne({ _id: userId, isActive: true, inActive: true });
        if (adultTalent) return adultTalent;

        return null;
    } catch (error) {

        return null;
    }
}

// Helper function to determine the user type based on their ID
async function determineUserType(userId) {
    const isBrand = await brandsmodel.exists({ _id: userId });
    if (isBrand) return 'brand';

    const isKid = await kidsmodel.exists({ _id: userId });
    if (isKid) return 'kids';

    const isAdult = await adultmodel.exists({ _id: userId });
    if (isAdult) return 'adult';

    return null;
}
// Function to save matched jobs
async function savematchedJobs(gigId) {
    try {
        // Update the matched field to true
        const gig = await gigsmodel.findByIdAndUpdate(
            gigId,
            { $set: { matched: true } },
            { new: true, runValidators: true } // Options to return the updated document and run validators
        );

        if (!gig) {
            throw new Error('Gig not found');
        }


    } catch (error) {
        console.error('Error updating the gig:', error.message);
    }
}
async function saveFavouritesJobs(brandId, talentId, gigId) {
    try {
        // Fetch details of brand, talent, and gig
        const brand = await findUserById(brandId);
        const talent = await findUserById(talentId);
        const gig = await gigsmodel.findById(gigId);

        // Determine user types for brand and talent
        const brandType = await determineUserType(brandId);
        const talentType = await determineUserType(talentId);

        // Create the notification document
        const favouritejob = new favouritesgigsmodel({
            brandId: brandId,
            talentId: talentId,
            gigId: gigId,
            isFavourite: true,
            type: talentType,
            brandDetails: {
                _id: brand._id,
                brandName: brand.brandName,
                brandEmail: brand.brandEmail,
                logo: brand.logo,
                brandImage: brand.brandImage
            },
            talentDetails: {
                _id: talent._id,
                parentFirstName: talent.parentFirstName,
                parentLastName: talent.parentLastName,
                parentEmail: talent.parentEmail,
                childFirstName: talent.childFirstName,
                childLastName: talent.childLastName,
                preferredChildFirstname: talent.preferredChildFirstname,
                preferredChildLastName: talent.preferredChildLastName,
                image: talent.image,
                childGender: talent.childGender,
                maritalStatus: talent.maritalStatus,
                childNationality: talent.childNationality,
                languages: talent.languages,
                childDob: talent.childDob,
                childPhone: talent.childPhone,
                // userType: talent.userType,
                isFavorite: talent.isFavourite,
                adultEmail: talent.adultEmail,
                parentMobileNo: talent.parentMobileNo,
            },
            gigDetails: {

                jobTitle: gig.jobTitle,
                jobLocation: gig.jobLocation,
                streetAddress: gig.streetAddress,
                employmentType: gig.employmentType,
                jobType: gig.jobType,
                jobDescription: gig.jobDescription,
                skills: gig.skills,
                additionalRequirements: gig.additionalRequirements,
                languages: gig.languages,
                hiringCompany: gig.hiringCompany,
                jobImage: gig.jobImage,
                matched: gig.matched,
                age: gig.age,
                gender: gig.gender,
                nationality: gig.nationality,
                questions: gig.questions,
                benefits: gig.benefits,
                compensation: gig.compensation,
                paymentType: gig.paymentType,
                minPay: gig.minPay,
                maxPay: gig.maxPay,
                whyWorkWithUs: gig.whyWorkWithUs,
                product: gig.product,
                valueOfProduct: gig.valueOfProduct,
                productDescription: gig.productDescription,
                hiringCompanyDescription: gig.hiringCompanyDescription,
                howLikeToApply: gig.howLikeToApply,
                jobCurrency: gig.jobCurrency,
                workSamples: gig.workSamples,
                type: gig.type,
                country: gig.country,
                state: gig.state,
                city: gig.city,
                lastDateForApply: gig.lastDateForApply,
                category: gig.category,
                isApproved: gig.isApproved,
                minAge: gig.minAge,
                maxAge: gig.maxAge,
                instaMin: gig.instaMin,
                instaMax: gig.instaMax,
                tikTokMin: gig.tikTokMin,
                tikTokMax: gig.tikTokMax,
                linkedInMin: gig.linkedInMin,
                linkedInMax: gig.linkedInMax,
                fbMin: gig.fbMin,
                fbMax: gig.fbMax,
                twitterMin: gig.twitterMin,
                twitterMax: gig.twitterMax,
                youTubeMin: gig.youTubeMin,
                youTubeMax: gig.youTubeMax,
                isActive: gig.isActive


            }
        });

        // Save the notification document
        await favouritejob.save();

    } catch (error) {
        console.error("Error saving favourite job:", error);
    }
}
/**
 * findFavouritesByTalentId
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const getSavedJobsByTalentId = async (req, res) => {
    try {
        // Find documents in favouritesgigsmodel where talentId matches the provided value
        const favourites = await favouritesgigsmodel.find({ talentId: req.body.talentId, isActive: true, isFavourite: true, 'gigDetails.isActive': true }).sort({ created: -1 }).exec();;
        favourites.reverse();
        // Return the found favourites
        return res.json({
            status: true,
            message: 'Data retrieved successfully',
            data: favourites
        });
    } catch (error) {

        return null;
    }
};
/**
 * getSkills
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const getSkills = async (req, res) => {
    try {
        // Use the aggregation pipeline to find all unique skills from active job listings and format them
        const uniqueSkills = await gigsmodel.aggregate([
            // { $match: { isActive: true } },  // Filter to include only active jobs
            { $unwind: '$skills' },         // Deconstruct the skills array
            { $group: { _id: null, skills: { $addToSet: '$skills' } } },  // Group to collect all unique skills
            { $project: { _id: 0, skills: 1 } },  // Remove '_id', just keep the skills array
            { $unwind: '$skills' },  // Unwind the unique skills array to transform each skill
            { $project: { value: '$skills', label: '$skills' } }  // Format each skill as required
        ]);

        // Convert the array of documents into the desired array of objects
        const formattedSkills = uniqueSkills.map(skill => ({
            value: skill.value,
            label: skill.label
        }));

        // Check if we found any skills
        if (formattedSkills.length > 0) {
            // Send the formatted skills array
            res.json({
                status: true,
                message: 'Skills retrieved successfully',
                data: formattedSkills
            });
        } else {
            // No skills found, return an empty array
            res.json({
                status: true,
                message: 'No skills found',
                data: []
            });
        }
    } catch (error) {

        res.status(500).json({
            status: false,
            message: 'Failed to retrieve skills'
        });
    }
};



/**
 *  removeFavouritesJob
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const removeFavouritesJob = async (req, res, next) => {
    try {
        const { gigId, talentId } = req.body; // Extract gigId and talentId from request body

        // Find the favourite job based on gigId, talentId, and isActive status
        const job = await favouritesgigsmodel.findOne({ gigId, talentId, isActive: true });

        // Check if job exists
        if (!job) {
            return res.json({
                status: false,
                message: 'Job not found'
            });
        }

        // Update all favourite job documents that match gigId and talentId to set gigDetails.matched to false and isFavourite to false
        const updatedFavouriteJob = await favouritesgigsmodel.updateMany(
            { gigId, talentId, isActive: true },
            { $set: { 'gigDetails.matched': false, isFavourite: false } },
            { new: true } // Return the updated documents
        );

        // Update the gig document to set matched to false
        const updatedGig = await gigsmodel.findByIdAndUpdate(
            gigId,
            { matched: false },
            { new: true } // Return the updated document
        );

        // If successful, send success response
        res.json({
            status: true,
            message: 'Removed Successfully',
            response: { updatedFavouriteJob, updatedGig }
        });
    } catch (error) {
        // If an error occurs, send error response

        res.status(500).json({
            status: false,
            message: 'An error occurred'
        });
    }
};
/**
 *  updatePassword
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const updatePassword = async (req, res, next) => {
    try {
        const { talentId, password, newPassword } = req.body;

        if (!talentId || !password || !newPassword) {
            return res.status(200).json({ status: false, message: 'Missing required fields' });
        }

        let talent = await kidsmodel.findOne({ _id: talentId, isActive: true, inActive: true });
        if (!talent) {
            talent = await adultmodel.findOne({ _id: talentId, isActive: true, inActive: true });
            if (!talent) {
                return res.status(200).json({ status: false, message: 'Talent not found or not active', });
            }
        }

        const isMatch = await bcrypt.compare(password, talent.talentPassword);
        if (!isMatch) {
            return res.status(200).json({ status: false, message: 'Old password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        talent.talentPassword = hashedPassword;
        talent.confirmPassword = hashedPassword;
        await talent.save();

        res.json({ status: true, message: 'Password updated successfully' });
    } catch (error) {

        res.status(200).json({ status: false, message: 'An error occurred' });
    }
};

/**
 * createJobAlert
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
// Function to send notifications using FCM
const sendNotificationss = async (fcmToken, title, text) => {
    if (!fcmToken) {
        console.error("FCM Token is required");
        return;
    }

    const notification = {
        title,
        text,
    };

    const notification_body = {
        notification: notification,
        to: fcmToken
    };

    try {
        const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification_body, {
            headers: {
                'Authorization': 'key=' + 'AAAARjamXEw:APA91bHBZ3tz5WuUrwCMI5IcuJQaufmHs2hUHUlE1su9-iPNpw3E2KTzqpVXXv2FDDa_qQV2yExoAgxgWNwF3CZAOu9IR1GO4gP04PPNK3Gv9x4UqwJUkrJFSIvEBaQZJOyjj4KujoEF', // Use environment variable for server key
                'Content-Type': 'application/json'
            }
        });

        console.log("Notification sent successfully", response.data);
    } catch (error) {
        console.error("Error sending notification", error.response ? error.response.data : error.message);
    }
};

// Function to save notifications to the database
const saveNotificationss = async (talentId, jobalert) => {
    try {
        // Fetch details of brand and gig
        const talent = await findUserById(talentId);
        // const gig = await gigsmodel.findById(gigId);

        // Create the notification document
        const notification = new notificationmodel({
            notificationType: 'Job Alert',
            //brandId: brandId,
            talentId: talentId,
            //gigId: gigId,
            brandNotificationMessage: jobalert,
            talentDetails: {
                parentFirstName: talent.parentFirstName,
                parentLastName: talent.parentLastName,
                parentEmail: talent.parentEmail,
                childFirstName: talent.childFirstName,
                childLastName: talent.childLastName,
                preferredChildFirstname: talent.preferredChildFirstname,
                preferredChildLastName: talent.preferredChildLastName,
                image: talent.image
            },

        });

        // Save the notification document
        const savedNotification = await notification.save();
        console.log("Notification saved successfully", savedNotification);
    } catch (error) {
        console.error("Error saving notification:", error);
    }
};
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: host,
        pass: pass
    }
});

const sendEmails = async (to, subject, html) => {
    const mailOptions = {
        from: host,
        to: to,
        subject: subject,
        html: html
    };

    await transporter.sendMail(mailOptions);
};

const createJobAlert = async (req, res, next) => {
    const { talentId, subscriptionType } = req.body;

    try {
        let talent = await kidsmodel.findById(talentId) || await adultmodel.findById(talentId);

        if (!talent) {
            return res.status(200).json({ status: false, msg: 'Talent or Brand not found' });
        }

        // Update isSubscribed field to true
        talent.isSubscribed = true;
        talent.subscriptionType = req.body.subscriptionType;
        await talent.save();

        // Prepare email content
        const emailHtml = `
            <html>
            <body>
                <p>Dear ${talent.parentFirstName || talent.firstName},</p>
                <p>You have successfully subscribed to job alerts.</p>
                <p>Best regards,</p>
                <p>Brands And Talent</p>
            </body>
            </html>
        `;

        // Determine email address
        const email = talent.parentEmail || talent.adultEmail;

        // Send email to the talent
        await sendEmails(email, 'Subscription Confirmation', emailHtml);

        // Define the notification sending function
        const checkAndSendNotifications = async () => {
            const today = new Date();
            const jobs = await gigsmodel.find({
                isActive: true,
                lastDateForApply: { $gte: today }
            });

            // Send notifications for kids
            const kids = await kidsmodel.find({
                _id: req.body.talentId,
                inActive: true,
                isActive: true,
                isSubscribed: true
            });



            for (const kid of kids) {
                const relevantJobs = jobs.filter(job => kid.relevantCategories.includes(job.category));

                if (relevantJobs.length > 0) {
                    const jobListings = relevantJobs.map(job => `
                        <div>
                            <h3><a href="https://brandsandtalent.com/link?jobId=${job._id}">${job.jobTitle}</a></h3>
                            <p><strong>Active Job:</strong> ${job.jobTitle}</p>
                            <p><strong>Location:</strong> ${job.jobLocation}</p>
                            <p>${job.jobDescription.slice(0, 100)}...</p>
                        </div>
                        <hr>
                    `).join('');

                    const emailContent = `
                        <html>
                        <body>
                            <h1>Active Job Alerts</h1>
                            ${jobListings}
                        </body>
                        </html>
                    `;
                    for (const job of relevantJobs) {
                        const jobalert = `
                            <html>
                            <body>
                                <p>Reminder: The application deadline for <strong>${job.jobTitle}</strong> in <strong>${job.jobLocation}</strong> is approaching.</p>
                            </body>
                            </html>
                        `;


                        await sendNotificationss(kid.fcmToken, 'Job Application Reminder', jobalert);



                        await saveNotificationss(kid._id, jobalert);
                        await sendEmails(kid.parentEmail, 'Job Application Reminder', emailContent);

                    }
                }
            }

            // Send notifications for adults
            const adults = await adultmodel.find({
                _id: req.body.talentId,
                inActive: true,
                isActive: true,
                isSubscribed: true
            });

            for (const adult of adults) {
                const relevantJobs = jobs.filter(job => adult.relevantCategories.includes(job.category));

                if (relevantJobs.length > 0) {
                    const jobListings = relevantJobs.map(job => `
                        <div>
                            <h3><a href="https://brandsandtalent.com/link?jobId=${job._id}">${job.jobTitle}</a></h3>
                            <p><strong>Active Job:</strong> ${job.jobTitle}</p>
                            <p><strong>Location:</strong> ${job.jobLocation}</p>
                            <p>${job.jobDescription.slice(0, 100)}...</p>
                        </div>
                        <hr>
                    `).join('');

                    const emailContent = `
                        <html>
                        <body>
                            <h1>Active Job Alerts</h1>
                            ${jobListings}
                        </body>
                        </html>
                    `;
                    for (const job of relevantJobs) {
                        const jobalert = `
                            <html>
                            <body>
                                <p>Reminder: The application deadline for <strong>${job.jobTitle}</strong> in <strong>${job.jobLocation}</strong> is approaching.</p>
                            </body>
                            </html>
                        `;



                        await sendNotificationss(adult.fcmToken, 'Job Application Reminder', jobalert);
                        await saveNotificationss(adult._id, jobalert);
                        await sendEmails(adult.adultEmail, 'Job Application Reminder', emailContent);

                    }
                }
            }
        };

        // Schedule cron job based on subscription type
        if (subscriptionType === 'weekly') {
            // Schedule cron job to run every minute

            cron.schedule('0 0 * * 0', () => {
                console.log('Running a weekly check for job application deadlines...');
                checkAndSendNotifications();
            });
        } else {
            cron.schedule('0 0 1,15 * *', () => {
                console.log('Running a bi-monthly check for job application deadlines...');
                checkAndSendNotifications();
            });
        }

        res.json({ status: true, msg: 'Subscribed Successfully' });
    } catch (error) {
        console.error("Error subscribing to job alerts", error);
        res.status(500).json({ status: false, msg: error.message });
    }
};


/**
 *updateJobAlert
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const updateJobAlert = async (req, res, next) => {
    const { talentId } = req.body;

    try {
        // Find talent and determine their type
        const talent = await findUserById(talentId);
        if (!talent) {
            return res.status(200).json({ status: false, msg: 'Talent or Brand not found' });
        }

        const talentType = await determineUserType(talentId);
        if (!talentType) {
            return res.status(200).json({ status: false, msg: 'User type not found for talent' });
        }

        // Determine the correct model based on the talent type
        const TalentModel = talentType === 'kids' ? kidsmodel : adultmodel;

        // Update isSubscribed to false
        const updatedTalent = await TalentModel.findByIdAndUpdate(talentId, {
            $set: { isSubscribed: false }
        }, { new: true });

        if (!updatedTalent) {
            return res.status(200).json({ status: false, msg: 'Failed to update subscription status' });
        }

        res.json({ status: true, msg: 'Subscription updated successfully' });
    } catch (error) {
        console.error("Error updating subscription status", error);
        res.status(500).json({ status: false, msg: error.message });
    }
};
/**
 * inviteTalentToApply
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const getJobDetails = async (gigId) => {
    try {
        // Assuming you have a model named gigsmodel to fetch job details
        const jobDetails = await gigsmodel.findById(gigId);

        // Return the job details
        return jobDetails;
    } catch (error) {
        console.error("Error fetching job details:", error);
        throw new Error("Failed to fetch job details");
    }
};
async function findUserById(talentId) {
    try {
        const brand = await brandsmodel.findOne({ _id: talentId, isActive: true, inActive: true });
        if (brand) return brand;

        const kidTalent = await kidsmodel.findOne({ _id: talentId, inActive: true, isActive: true });
        if (kidTalent) return kidTalent;

        const adultTalent = await adultmodel.findOne({ _id: talentId, inActive: true, isActive: true });
        if (adultTalent) return adultTalent;

        return null;
    } catch (error) {
        console.error("Error finding user by ID:", error);
        return null;
    }
}
// Function to send notifications using FCM
const sendNotificatio = async (fcmToken, title, text) => {
    if (!fcmToken) {
        console.error("FCM Token is required");
        return;
    }

    const notification = {
        title,
        text,
    };

    const notification_body = {
        notification: notification,
        to: fcmToken
    };

    try {
        const response = await axios.post('https://fcm.googleapis.com/fcm/send', notification_body, {
            headers: {
                'Authorization': 'key=' + 'AAAARjamXEw:APA91bHBZ3tz5WuUrwCMI5IcuJQaufmHs2hUHUlE1su9-iPNpw3E2KTzqpVXXv2FDDa_qQV2yExoAgxgWNwF3CZAOu9IR1GO4gP04PPNK3Gv9x4UqwJUkrJFSIvEBaQZJOyjj4KujoEF', // Use environment variable for server key
                'Content-Type': 'application/json'
            }
        });

        console.log("Notification sent successfully", response.data);
    } catch (error) {
        console.error("Error sending notification", error.response ? error.response.data : error.message);
    }
};
const saveNotificatio = async (talentId, brandId, gigId, talentNotificationMessage) => {
    try {
        // Fetch details of brand and gig
        const talent = await findUserById(talentId);
        const gig = await gigsmodel.findById(gigId);
        const brand = await brandsmodel.findById(brandId);

        // Create the notification document
        const notification = new notificationmodel({
            notificationType: 'Job Alert',
            brandId: brandId,
            talentId: talentId,
            gigId: gigId,
            talentNotificationMessage: talentNotificationMessage,
            talentDetails: {
                parentFirstName: talent.parentFirstName,
                parentLastName: talent.parentLastName,
                parentEmail: talent.parentEmail,
                childFirstName: talent.childFirstName,
                childLastName: talent.childLastName,
                preferredChildFirstname: talent.preferredChildFirstname,
                preferredChildLastName: talent.preferredChildLastName,
                image: talent.image
            },
            brandDetails: {
                _id: brand._id,
                brandName: brand.brandName,
                brandEmail: brand.brandEmail,
                logo: brand.logo,
                brandImage: brand.brandImage
            },
            gigDetails: {
                jobTitle: gig.jobTitle,
                category: gig.category,
                minAge: gig.minAge,
                maxAge: gig.maxAge,
                instaMin: gig.instaMin,
                instaMax: gig.instaMax,
                tikTokMin: gig.tikTokMin,
                tikTokMax: gig.tikTokMax,
                linkedInMin: gig.linkedInMin,
                linkedInMax: gig.linkedInMax,
                fbMin: gig.fbMin,
                fbMax: gig.fbMax,
                twitterMin: gig.twitterMin,
                twitterMax: gig.twitterMax,
                youTubeMin: gig.youTubeMin,
                youTubeMax: gig.youTubeMax
            }


        });

        // Save the notification document
        const savedNotification = await notification.save();
        console.log("Notification saved successfully", savedNotification);
    } catch (error) {
        console.error("Error saving notification:", error);
    }
};
const inviteTalentToApply = async (req, res, next) => {
    const { talentId, gigId, brandId, comments } = req.body;

    try {
        // Fetch brand and talent details
        const brand = await findUserById(brandId);
        const talent = await findUserById(talentId);

        if (!brand) {
            return res.status(200).json({ status: false, msg: 'Brand not found' });
        }
        if (!talent) {
            return res.status(200).json({ status: false, msg: 'Talent not found' });
        }
        console.log("talent", talent)
        console.log("talentdfdvg", talent.subscriptionType)
        // Check plan names for both brand and talent
        const brandPlanName = brand.planName;
        const talentPlanName = talent.planName;  // Assuming the talent also has a planName field
        //console.log("talentPlanName",talentPlanName)

        console.log("talent", talent)

        //  if ((brandPlanName === 'Pro' || brandPlanName === 'Premium') && (talentPlanName === 'Pro' || talentPlanName === 'Premium')) {
        const talentType = await determineUserType(talentId);
        if (!talentType) {
            return res.status(200).json({ status: false, msg: 'User type not found for talent' });
        }

        // Determine the correct model based on the talent type
        const TalentModel = talentType === 'kids' ? kidsmodel : adultmodel;

        // Determine the email address to send the invitation to
        const email = talent.parentEmail || talent.adultEmail;

        // Fetch job details from database or another source
        const jobDetails = await getJobDetails(gigId);
        const jobTitle = jobDetails.jobTitle;
        const jobDescription = jobDetails.jobDescription;

        // Define default email HTML content
        const defaultEmailHtml = `
            <html>
            <body>
            <p>Hi ${talent.parentFirstName || talent.firstName},</p>
            <p>We think you'd be a great fit for an exciting opportunity with us. We would love for you to apply for the ${jobTitle} role.</p>
            <p>Please apply at <strong><a href="https://brandsandtalent.com/preview-job-talent?${gigId}">this link</a></strong>. Looking forward to your application! Should you need more info, please feel free to contact us at ${email}.</p>
            <p>Best regards,</p>
            <p>Brands and Talent</p>
            </body>
            </html>
`;

        if (req.body.comments) {
            await sendEmails(email, 'Exciting Job Opportunity Awaits!', comments);
        }
        else {
            await sendEmails(email, 'Exciting Job Opportunity Awaits!', defaultEmailHtml);
        }
        const jobalert = `You have been invited to apply for ${jobTitle}`;
        await saveNotificatio(talent._id, brandId, gigId, jobalert);


        await sendNotificatio(talent.fcmToken, 'Exciting Job Opportunity Awaits!', jobalert);

        res.json({ status: true, msg: 'Invitation sent successfully' });

    } catch (error) {

        res.status(500).json({ status: false, msg: error.message });
    }
};


/**
*********isApprovedForjobApproval******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const isApprovedForjobByPlan = async (req, res, next) => {
    try {
        const gigId = req.body.gigId;
        const updatedGig = await draftmodel.findOneAndUpdate(
            { isActive: true, _id: gigId },
            { isApproved: true },
            { new: true } // To return the updated document
        );


        res.json({
            message: "Approved",
            status: true,
            data: updatedGig
        });
    } catch (error) {

        res.json({
            message: "An error occurred",
            status: false,
            error: error
        });
    }
};

/**
*********get brand jobs******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getBrandJobs = async (req, res, next) => {
    try {
        // Extracting brandId from request body or parameters
        const brandId = req.body.brandId || req.params.brandId;
        const today = new Date();

        // Finding active gigs sorted by creation date in descending order
        const gigs = await gigsmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true, adminApproved: true, lastDateForApply: { $gte: today } }).sort({ created: -1 });

        // Finding active draft gigs sorted by creation date in descending order
        const draft = await draftmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true, lastDateForApply: { $gte: today } }).sort({ created: -1 });

        // Combine gigs and draft arrays
        const combinedJobs = gigs.concat(draft);

        // If no active gigs are found, send an empty array in the response
        if (combinedJobs.length === 0) {
            return res.json({
                status: true,
                data: [] // Return an empty array for data
            });
        }

        // Reverse the order of jobs (if necessary)
        combinedJobs.reverse();

        // Sending the combined jobs back in the response as an array of objects
        res.json({
            status: true,
            data: combinedJobs // No need to encapsulate jobs within an array
        });

    } catch (error) {
        // Log the error and send a 500 internal server error response

        res.status(500).json({
            status: false,
            message: 'Server error'
        });
    }
};
/**
*******getAllNotification**
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getAllNotification = async (req, res, next) => {
    try {



        // Fetch all active notifications for the specified brandId
        const notifications = await notificationmodel.find({
            notificationType: { $in: ['Registration Approval for talent', 'Job Approval', 'Help And Support', 'Talent Verification Approval', 'Talent Profile Approval', 'Review Notification'] },
            isActive: true,
        }).sort({ createdAt: -1 });


        // You could uncomment and modify this if you have a draft model to fetch drafts as well
        // const drafts = await draftmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true }).sort({ createdAt: -1 });

        res.json({
            status: true,
            data: notifications
        });
    } catch (error) {

        res.status(500).json({
            status: false,
            msg: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

/**
********saveUser***
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const saveUser = async (req, res, next) => {
    try {
        const { tempId } = req.body;

        // Ensure tempId exists in the request body
        if (!tempId) {
            return res.status(400).json({ message: 'tempId is required' });
        }

        // Check if a user with the given tempId already exists
        let user = await userdatamodel.findOne({ isActive: true });

        if (user) {
            // If the user exists, update the user
            user.tempId = tempId; // Update with the new tempId if needed
            await user.save();
        } else {
            // If the user doesn't exist, create a new one
            user = await userdatamodel.create({ tempId });
        }

        return res.status(200).json({ message: 'tempId saved successfully', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

/**
********fetchUser***
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const fetchUser = async (req, res, next) => {
    try {

        // Find user by tempId in userdatamodel
        const user = await userdatamodel.findOne({ isActive: true });

        // If no user is found
        if (!user) {
            return res.status(200).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User found', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error });
    }
};


/**
********get  notifications***
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getNotification = async (req, res, next) => {
    try {
        const userId = req.body.talentId || req.body.brandId;

        if (!userId) {
            return res.status(200).json({
                status: false,
                msg: 'User ID (Talent/Brand) is required'
            });
        }

        // Fetch all active notifications for the specified user (talentId or brandId), excluding certain notification types
        const notifications = await notificationmodel.find({
            $or: [
                { talentId: new mongoose.Types.ObjectId(userId) },
                { brandId: new mongoose.Types.ObjectId(userId) }
            ],
            notificationType: {
                $nin: [
                    'Registration Approval for talent',
                    'Job Approval',
                    'Help And Support',
                    'Talent Verification Approval',
                    'Talent Profile Approval',
                    'Review Notification'
                ]
            },
            isActive: true
        }).sort({ createdAt: -1 });

        // Send the remaining notifications in the response
        res.json({
            status: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

/**
********inviteTalentNotification***
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/

const inviteTalentNotification = async (req, res, next) => {
    try {
        const { talentId } = req.body;

        // Check in adultmodel
        let talent = await adultmodel.findById(talentId);

        // If not found in adultmodel, check in kidsmodel
        let modelType = 'adult'; // Default to adultmodel
        if (!talent) {
            talent = await kidsmodel.findById(talentId);
            modelType = 'kid'; // Switch to kidsmodel
        }

        if (!talent) {
            return res.status(200).json({ message: 'Talent not found' });
        }

        const { planName } = talent;

        // Check the plan name
        if (planName === 'Basic') {
            // Determine the email based on whether it's from adultmodel or kidsmodel
            let email;
            if (modelType === 'adult') {
                email = talent.adultEmail; // Email for adultmodel
            } else if (modelType === 'kid') {
                email = talent.parentEmail; // Email for kidsmodel
            }

            // Log the email to ensure it's being set correctly
            console.log("Recipient email:", email);

            // Ensure the email is valid before proceeding
            if (!email || email.trim() === '') {
                return res.status(200).json({ message: 'No valid email found for the talent.' });
            }

            // Send the email logic


            await sendMails(email, 'Invitation', `
                    <h1>A new job for you!</h1>
                    <p> An invitation from a brand is available only after upgrading to a Pro or Premium membership. </p>
                    <p>An invitation from a brand has been extended to you, but you can only access this invitation by upgrading to a Pro or Premium membership.</p>
                    <p>To access the invitation from the brand, an upgrade to a Pro or Premium membership is required.</p>
                <p>Best regards,</p>
                <p>Brands and Talent</p>
                </body>
                </html>
                `);

            return res.status(200).json({ message: 'Invitation email sent successfully' });
        } else {
            return res.status(200).json({ message: 'Talent is not on the Basic plan' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Email sending function
const sendMails = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: host,  // Replace with your host email address
            to: to,
            subject: subject,
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email sending failed');
    }
};




module.exports = {
    createJob, getAllJobs, getJobsByID, draftJob, getDraftJobsByID, getDraftJobs, postJobByDraft,
    editJob, editDraft, getBrandPostedJobsByID, getBrandDraftJobsByID, getPostedJobs,
    deleteJob, getAnyJobById, jobCount, searchJobs, applyJobs, readNotification, getBrandNotification,
    getTalentNotification, getCountNotification, saveUser, fetchUser, getAppliedjobs, selectedLevelRange,
    informSelectedLevel, newCandidates, getSelectionList, updateFavouriteJobs,
    getSavedJobsByTalentId, getSkills, removeFavouritesJob, updatePassword, createJobAlert,
    updateJobAlert, inviteTalentToApply, isApprovedForjobByPlan, getBrandJobs, getAllNotification, getNotification, inviteTalentNotification

};