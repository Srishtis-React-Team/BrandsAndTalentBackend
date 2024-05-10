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

const nodemailer = require('nodemailer');


const gigsmodel = require('../models/gigsmodel');
const draftmodel = require("../models/draftmodel");
const brandsmodel = require("../models/brandsmodel");
const kidsmodel = require("../../users/models/kidsmodel");
const adultmodel = require("../../users/models/adultmodel");
const notificationmodel = require("../models/notificationmodel");

/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const createJob = async (req, res, next) => {
    try {
        const add_gigs = new gigsmodel({
            jobTitle, jobLocation, streetAddress, workplaceType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage,country,state,city,jobPostedDate,lastDateForApply// isActive: true
        } = req.body);

        const response = await add_gigs.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: add_gigs,
        });
    } catch (error) {
        console.error("Error in createJob:", error);
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
        // Fetching all active gigs and sorting them by creation date in descending order
        const gigs = await gigsmodel.find({ isActive: true }).sort({ created: -1 }).exec();

        // Create modified data with an "isApplied" status
        let modifiedData = await Promise.all(gigs.map(async (gig) => {
            const application = await notificationmodel.findOne({ gigId: gig._id, talentId: talentId });
            return {
                ...gig._doc,
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
            error: error
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
        const gig = await gigsmodel.findOne({ _id: gigId, isActive: true }).sort({ created: -1 });

        if (!gig) {
            // If no gig is found, send a 404 not found response
            return res.status(404).json({
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
        console.error("Error fetching gig:", error);
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
const draftJob = async (req, res, next) => {
    try {
        const add_gigs = new draftmodel({
            jobTitle, jobLocation, streetAddress, workplaceType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage,brandImage,country,state,city,jobPostedDate,lastDateForApply// isActive: true
        } = req.body);

        const response = await add_gigs.save();

        return res.json({
            message: "Draft Added Successfully",
            status: true,
            data: add_gigs,
        });
    } catch (error) {
        console.error("Error in createJob:", error);
        return res.json({
            message: "An Error Occurred"
        });
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
            return res.status(404).json({
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
        console.error("Error fetching gig:", error);
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
        const draftGig = await draftmodel.findOne({ _id: gigId, isActive: true });

        // Check if draft gig exists
        if (!draftGig) {
            return res.status(404).json({
                status: false,
                message: 'Draft gig not found'
            });
        }

        // Create a new gig using the details from draftGig
        const newGig = new gigsmodel({
            jobPostedDate:draftGig.jobPostedDate,
            lastDateForApply:draftGig.lastDateForApply,
            country:draftGig.country,
            state:draftGig.state,
            city:draftGig.city,
            brandImage:draftGig.brandImage,
            brandId: draftGig.brandId,
            jobTitle: draftGig.jobTitle,
            jobType:draftGig.jobType,
            jobLocation: draftGig.jobLocation,
            streetAddress: draftGig.streetAddress,
            workplaceType: draftGig.workplaceType,
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
            isActive: true,
            type: "Posted"
        });

        // Save the new gig to the database
        const savedGig = await newGig.save();

        // Update the draft gig's isActive field to false
        await draftmodel.findOneAndUpdate({ _id: gigId }, { isActive: false });

        // Send success response with saved gig data
        return res.status(201).json({
            status: true,
            message: "Draft Added Successfully",
            data: savedGig,
        });

    } catch (error) {
        // Log the error and send a 500 internal server error response
        console.error("Error in postJobByDraft:", error);
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
            jobTitle, jobLocation, streetAddress, workplaceType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage,brandImage,country,state,city,jobPostedDate,lastDateForApply
        } = req.body;

        // Construct update object
        const updateFields = {
            jobTitle, jobLocation, streetAddress, workplaceType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage,brandImage,country,state,city,jobPostedDate,lastDateForApply
        };

        // Update the draft document
        const updatedDraft = await draftmodel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(gigId) },
            updateFields,
            { new: true } // Return the updated document
        );

        if (!updatedDraft) {
            return res.status(404).json({
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
        console.error("Error occurred while updating draft:", error);
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
            jobTitle, jobLocation, streetAddress, workplaceType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage,brandImage,country,state,city,jobPostedDate,lastDateForApply// isActive: true if needed
        } = req.body;

        // Use a plain object for the fields to be updated
        const updateFields = {
            jobTitle, jobLocation, streetAddress, workplaceType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage,brandImage,country,state,city,jobPostedDate,lastDateForApply // Include isActive: true if updating this field as well
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
        console.error("Error in editJob:", err);
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

        // Since we're using async/await, there's no need to use .then() and .catch() here.
        const gigs = await draftmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true }).sort({ created: -1 });

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
        console.error("Error fetching gigs:", error);
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


        // Since we're using async/await, there's no need to use .then() and .catch() here.
        const gigs = await gigsmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true }).sort({ created: -1 });

        if (gigs.length === 0) {
            // If no gigs are found, send an empty array in the response
            return res.json({
                status: true,
                data: [] // Return an empty array for data
            });
        }

        // If gigs are found, send them back in the response as an array of objects
        res.json({
            status: true,
            data: gigs // No need to encapsulate gigs within an array
        });

    } catch (error) {
        // Log the error and send a 500 internal server error response
        console.error("Error fetching gigs:", error);
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
        console.log("userId",userId)

    
        // Fetch all active gigs and drafts for the user's brandId
        const gigs = await gigsmodel.find({ brandId: new mongoose.Types.ObjectId(userId), isActive: true }).sort({ createdAt: -1 });
        const drafts = await draftmodel.find({ brandId: new mongoose.Types.ObjectId(userId), isActive: true }).sort({ createdAt: -1 });

        // Combine gigs and drafts into a single array and sort them by creation date, newest first
        const jobs = [...gigs, ...drafts].sort((a, b) => b.createdAt - a.createdAt);

        res.json({
            status: true,
            data: jobs
        });
    } catch (error) {
        console.error("Error fetching all jobs:", error);
        res.status(500).json({
            status: false,
            error: error
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

        // If successful, send success response
        res.json({
            status: true,
            message: 'Deleted Successfully',
            response: updatedJob
        });
    } catch (error) {
        // If an error occurs, send error response
        console.error("Error in deleteDraftJob:", error);
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
        let job = await gigsmodel.findById({ _id: gigId, isActive: true }).sort({ createdAt: -1 });

        // If not found in gigsmodel, try to find it in draftmodel
        if (!job) {
            job = await draftmodel.findById({ _id: gigId, isActive: true }).sort({ createdAt: -1 });
        }

        // If the job is not found in both models
        if (!job) {
            return res.status(404).json({ status: false, msg: 'Job not found' });
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
            isActive: true
        });

        const postJobCount = await gigsmodel.countDocuments({
            brandId: new mongoose.Types.ObjectId(brandId),
            isActive: true
        });

        // Calculate the total count of drafts and post jobs
        const CampaignCount = draftCount + postJobCount;

        // Retrieve the current brandsmodel document
        let brand = await brandsmodel.findOne({ _id: new mongoose.Types.ObjectId(brandId) });

        if (!brand) {
            return res.status(404).json({ status: false, message: "Brand not found" });
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
            { type: "totalCampaigns", count:CampaignCount }
        ];

        res.json({
            status: true,
            message: "Counts updated successfully",
            data: countsArray
        });
    } catch (error) {
        console.error("Error updating counts:", error);
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
        const { jobTitle, jobLocation } = req.body;

        // Build query criteria
        const queryCriteria = { isActive: true };
        if (jobTitle) {
            queryCriteria.jobTitle = { $regex: new RegExp(jobTitle, 'i') }; // Case-insensitive search for jobTitle
        }
        if (jobLocation) {
            queryCriteria.jobLocation = { $regex: new RegExp(jobLocation, 'i') }; // Case-insensitive search for jobLocation
        }

        // Find matching gigs
        const gigs = await gigsmodel.find(queryCriteria).sort({ created: -1 });

        // Send response
        res.json({
            status: true,
            data: gigs
        });
    } catch (error) {
        // Handle errors
        console.error("Error in searching jobs:", error);
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
            return res.status(404).json({ status: false, msg: 'Talent or Brand not found' });
        }

        // Determine the correct model based on the talent type
        const talentType = await determineUserType(talentId);
        if (!talentType) {
            return res.status(404).json({ status: false, msg: 'User type not found for talent' });
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
            $set: { isApplied: true},
            $push: { 
                applications: {
                    gigId: gigId,
                    isApplied: true,
                    brandId: brandId
                },
                
            },
            gigId: gigId,
                brandId: brandId
        });

        // // Update the talent document with the application details
        // await TalentModel.findByIdAndUpdate(talentId, { $set: { gigId: gigId, isApplied: true, brandId: brandId } });

        // Notification content
        const brandNotificationMessage = `A talent has applied for a job`;//gig ${gigId}
        const talentNotificationMessage = 'You have successfully applied for the job';

        // Save a single notification in the database for both brand and talent
        await saveNotification(brandId, talentId, gigId, brandNotificationMessage, talentNotificationMessage);

        // Send notifications
        await sendNotification(brand.fcmToken, 'New Job Application', brandNotificationMessage);
        await sendNotification(talent.fcmToken, 'Application Successful', talentNotificationMessage);

        res.json({ status: true, msg: 'Application processed and notifications sent' });
    } catch (error) {
        console.error("Error applying for job", error);
        res.status(500).json({ status: false, msg: error.message });
    }
};
// Helper function to find a user by their ID
async function findUserById(userId) {
    try {
        const brand = await brandsmodel.findOne({ _id: userId });
        if (brand) return brand;

        const kidTalent = await kidsmodel.findOne({ _id: userId });
        if (kidTalent) return kidTalent;

        const adultTalent = await adultmodel.findOne({ _id: userId });
        if (adultTalent) return adultTalent;

        return null;
    } catch (error) {
        console.error("Error finding user by ID:", error);
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
        console.error("FCM Token is required");
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
// Adjusted helper function to save a single notification
async function saveNotification(brandId, talentId, gigId, brandNotificationMessage, talentNotificationMessage) {
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
                _id: brand._id,
                brandName: brand.brandName,
                brandEmail: brand.brandEmail,
                logo: brand.logo,
                brandImage: brand.brandImage
                // Add other brand details as needed
            },
            talentDetails: {
                _id: talent._id,
                parentFirstName: talent.parentFirstName,
                parentLastName: talent.parentLastName,
                parentEmail: talent.parentEmail || talent.adultEmail,
                childFirstName: talent.childFirstName,
                childLastName: talent.childLastName,
                preferredChildFirstname: talent.preferredChildFirstname,
                preferredChildLastName: talent.preferredChildLastName,
                image: talent.image
                // Add other talent details as needed
            },
            gigDetails: {
                jobTitle: gig.jobTitle // Assuming gig has a field named jobTitle
                // Add other gig details as needed
            }
        });

        // Save the notification document
        const savedNotification = await notification.save();
        console.log("Notification saved successfully", savedNotification);
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
        console.error("Error fetching notifications:", error);
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
        console.error("Error fetching notifications:", error);
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
        console.error("Error fetching notifications:", error);
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
        let user = await kidsmodel.findOne({ _id: userId, isActive: true });

        if (!user) {
            // If no entry in kidsmodel, try adultmodel
            user = await adultmodel.findOne({ _id: userId, isActive: true });
        }

        if (!user || !user.applications || user.applications.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No applications found'
            });
        }

        // Map the gigIds from the applications array
        const gigIds = user.applications.map(application => application.gigId);
        console.log("gigIds",gigIds)
        // Fetch all gig details using gigIds
        const gigDetails = await Promise.all(
            gigIds.map(gigId => gigsmodel.findById(gigId))
        );
        console.log("gigDetails",gigDetails)
        // Filter out any null responses (in case some gigs were not found)
        const validGigDetails = gigDetails.filter(detail => detail !== null);

  console.log("validGigDetails",validGigDetails)
        if (validGigDetails.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Gig details not found'
            });
        }

        res.json({
            status: true,
            data: validGigDetails
        });

    } catch (error) {
        console.error("Error fetching gigs:", error);
        res.status(500).json({
            status: false,
            message: 'Server error'
        });
    }
};
/**
 * removeJobsAfterLastDate
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */

/**
 * selectedLevelRange
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */



const selectedLevelRange = async (req, res, next) => {
    try {
        const talentId = req.body.talentId;
        const selectedLevel = req.body.selectedLevel;

        if (!talentId || !selectedLevel) {
            return res.status(400).json({
                status: false,
                message: 'talentId and selectedLevel are required'
            });
        }

        // Find talent in either kids or adult collection based on talentId
        const kids = await kidsmodel.findOne({ _id: talentId, isActive: true });
        const adult = await adultmodel.findOne({ _id: talentId, isActive: true });

        // Update selectedLevel for the corresponding record
        if (kids) {
            await kidsmodel.findByIdAndUpdate(talentId, { selectedLevel });
        } else if (adult) {
            await adultmodel.findByIdAndUpdate(talentId, { selectedLevel });
        } else {
            return res.status(404).json({
                status: false,
                message: 'No active record found for the given talentId'
            });
        }

        // Success response if update is successful
        res.json({
            status: true,
            message: 'Selected level updated successfully'
        });

    } catch (error) {
        console.error("Error updating selected level:", error);
        res.status(500).json({
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

        if (!talentId || !selectedLevel ) {
            return res.status(400).json({
                status: false,
                message: 'talentId, selectedLevel, and text are required'
            });
        }

        // Find the talent and decide the recipient email based on whether they are a kid or an adult
        const kid = await kidsmodel.findOne({ _id: talentId, isActive: true }).select('childEmail parentEmail');
        const adult = await adultmodel.findOne({ _id: talentId, isActive: true }).select('adultEmail contactEmail');

        let emails = [];
        if (kid) {
            emails.push(kid.childEmail, kid.parentEmail);
        } else if (adult) {
            emails.push(adult.adultEmail, adult.contactEmail);
        } else {
            return res.status(404).json({
                status: false,
                message: 'No active talent found with the provided talentId'
            });
        }

        // Setup the nodemailer transporter
        const transporter = nodemailer.createTransport({
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
            text:'Hai,'
            
        };

        // Modify email content and subject based on selectedLevel
        switch (selectedLevel) {
            
            case 'shortlistedCandidates':
                mailOptions.subject = 'Congratulations, You Have Been Shortlisted!';
                mailOptions.text += ' You have been shortlisted for the next stage.';
                break;
            case 'rejectedCandidates':
                mailOptions.subject = 'Regret, You Have Been Rejected';
                mailOptions.text += ' We regret to inform you that you were not selected.';
                break;
            case 'interviewInvitations':
                const interviewType = req.body.interviewType;
                const meetingLink = req.body.meetingLink; // For online interviews
                const officeAddress = req.body.officeAddress; // For offline interviews
                if (!interviewType) {
                    return res.status(400).json({
                        status: false,
                        message: 'interviewType is required for interview invitations'
                    });
                }
                mailOptions.subject = 'Interview Invitation';
                mailOptions.text += ` This will be a ${interviewType} interview. `;
                // Append additional information based on interview type
                if (interviewType === 'online') {
                    if (meetingLink) {
                        mailOptions.text += `Here is your meeting link: ${meetingLink}.`;
                    } else {
                        mailOptions.text += 'A meeting link will be provided soon.';
                    }
                } else if (interviewType === 'offline') {
                    if (officeAddress) {
                        mailOptions.text += `Please attend in person at the following address: ${officeAddress}.`;
                    } else {
                        mailOptions.text += 'Please attend in person at our office. The exact address will be provided soon.';
                    }
                }
                // if (interviewType === 'online') {
                //     mailOptions.text += 'A meeting link will be provided.';
                // } else {
                //     mailOptions.text += 'Please attend in person at our office.';
                // }
                break;
            default:
                return res.status(400).json({
                    status: false,
                    message: 'Invalid selectedLevel value'
                });
        }

        // Send the email
        await transporter.sendMail(mailOptions);

        // Respond with success if the email was sent successfully
        res.json({
            status: true,
            message: 'Email sent successfully to all relevant contacts'
        });

    } catch (error) {
        console.error("Error sending email:", error);
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

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const newCandidates = async (req, res) => {
  try {
    const { brandId } = req.body;

    if (!brandId || !isValidObjectId(brandId)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid or missing Brand ID',
      });
    }

    //Fetch all kids and adults with the specified Brand ID and populate gig details
    const kids = await kidsmodel.find({ brandId, isActive: true })
    .populate({
      path: 'applications.gigId',
      model: 'Gigs', // Ensure 'Gigs' is the correct model name
    });
    const adults = await adultmodel.find({ brandId, isActive: true })
    .populate({
      path: 'applications.gigId',
      model: 'Gigs',
    });

    const allTalents = [...kids, ...adults];

    if (allTalents.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No talents found for the provided Brand ID',
      });
    }

    // Create an array to store gig details with talent information
    const gigs = [];

    allTalents.forEach((talent) => {
      talent.applications.forEach((application) => {
        const gig = application.gigId;

        if (gig) {
          const gigIdStr = gig._id.toString();
          let gigEntry = gigs.find(g => g.gigId === gigIdStr);

          if (!gigEntry) {
            // If it's the first time we're encountering this gigId, create new entry
            gigEntry = {
              gigId: gigIdStr,
              gigDetails: gig,
              talents: []
            };
            gigs.push(gigEntry);
          }

          // Add talent to the gig's list of talents
          gigEntry.talents.push({
            talentId: talent._id,
            talentDetails: talent,
          });
        }
      });
    });

    return res.status(200).json({
      status: true,
      message: 'Success',
      gigs: gigs, // An array of gigs each containing their details and associated talents
    });
  } catch (error) {
    console.error("Error in newCandidates:", error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};


const isValidObjectID = (id) => mongoose.Types.ObjectId.isValid(id);

const getSelectionList = async (req, res) => {
  try {
    const { brandId } = req.body;

    if (!brandId || !isValidObjectID(brandId)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid or missing Brand ID',
      });
    }

    //Fetch all kids and adults with the specified Brand ID and populate gig details
    const kids = await kidsmodel.find({ brandId, isActive: true,selectedLevel:req.body.selectedLevel })
    .populate({
      path: 'applications.gigId',
      model: 'Gigs', // Ensure 'Gigs' is the correct model name
    });
    const adults = await adultmodel.find({ brandId, isActive: true,selectedLevel:req.body.selectedLevel })
    .populate({
      path: 'applications.gigId',
      model: 'Gigs',
    });

    const allTalents = [...kids, ...adults];

    if (allTalents.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No talents found for the provided Brand ID',
      });
    }

    // Create an array to store gig details with talent information
    const gigs = [];

    allTalents.forEach((talent) => {
      talent.applications.forEach((application) => {
        const gig = application.gigId;

        if (gig) {
          const gigIdStr = gig._id.toString();
          let gigEntry = gigs.find(g => g.gigId === gigIdStr);

          if (!gigEntry) {
            // If it's the first time we're encountering this gigId, create new entry
            gigEntry = {
              gigId: gigIdStr,
              gigDetails: gig,
              talents: []
            };
            gigs.push(gigEntry);
          }

          // Add talent to the gig's list of talents
          gigEntry.talents.push({
            talentId: talent._id,
            talentDetails: talent,
          });
        }
      });
    });

    return res.status(200).json({
      status: true,
      message: 'Success',
      gigs: gigs, // An array of gigs each containing their details and associated talents
    });
  } catch (error) {
    console.error("Error in newCandidates:", error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
    createJob, getAllJobs, getJobsByID, draftJob, getDraftJobsByID, getDraftJobs, postJobByDraft,
    editJob, editDraft, getBrandPostedJobsByID, getBrandDraftJobsByID, getPostedJobs,
    deleteJob, getAnyJobById,jobCount,searchJobs,applyJobs,readNotification,getBrandNotification,
    getTalentNotification,getCountNotification,getAppliedjobs,selectedLevelRange,
    informSelectedLevel,newCandidates,getSelectionList//removeJobsAfterLastDate

};