const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');


const gigsmodel = require('../models/gigsmodel');

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
            whyWorkWithUs,product,valueOfProduct,productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage,// isActive: true
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
const getAllJobs = async (req, res, next) => {

    gigsmodel.find({ isActive: true}).sort({ created: -1 })
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
*********get job by id******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getJobsByID = async (req, res, next) => {
    try {
        const gigId = req.body.gigId || req.params.gigId;

        /* Authentication (Uncomment and adjust as necessary)
        const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
        if (!authResult) {
          return res.status(401).json({ status: false, msg: 'Authentication failed' });
        }
        */

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




module.exports = {
    createJob, getAllJobs,getJobsByID

};