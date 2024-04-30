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

// const getPostedJobs = async (req, res, next) => {
//     const talentId = req.body.talentId;

//     try {
//         const gigs = await gigsmodel.find({ isActive: true }).sort({ created: -1 }).exec();
//         let modifiedData = await Promise.all(gigs.map(async (gig) => {
//             const application = await notificationmodel.findOne({ gigId: gig._id, talentId: talentId });
//             return {
//                 ...gig._doc,
//                 isApplied: application ? "Applied" : "Apply Now"
//             };
//         }));
//         res.json({
//             status: true,
//             data: modifiedData
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             message: 'Error fetching posted jobs',
//             error: error
//         });
//     }
// };




// const getPostedJobs = async (req, res, next) => {
//     // const userId = req.body.userId || req.params.userId;
//     /* Authentication (Uncomment and adjust as necessary)
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.status(401).json({ status: false, msg: 'Authentication failed' });
//     }
//     */
//     gigsmodel.find({ isActive: true }).sort({ created: -1 })
//         .then((response) => {
//             const reversedData = response.reverse();  // Reversing the data array
//             res.json({
//                 status: true,
//                 data: reversedData  // Send reversed data
//             });
//         })
//         .catch((error) => {
//             res.status(500).json({
//                 status: false,
//                 message: 'Error fetching posted jobs',
//                 error: error
//             });
//         });
// };

// const getPostedJobs = async (req, res, next) => {
//     // const userId = req.body.userId || req.params.userId;
//     /* Authentication (Uncomment and adjust as necessary)
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.status(401).json({ status: false, msg: 'Authentication failed' });
//     }
//     */
//     gigsmodel.find({ isActive: true }).sort({ created: -1 })

//         .then((response) => {
//             res.json({
//                 status: true,
//                 data: response
//             });
//         })
//         .catch((error) => {
//             res.json({
//                 Status: false,
//             });
//         });
// };
/**
*********get job by id******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getJobsByID = async (req, res, next) => {
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
            workSamples, jobImage,// isActive: true
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
    // const userId = req.body.userId || req.params.userId;


    /* Authentication (Uncomment and adjust as necessary)
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
        return res.status(401).json({ status: false, msg: 'Authentication failed' });
    }
    */
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

// const postJobByDraft = async (req, res, next) => {
//     try {
//         // Extract gigId from request body or parameters
//         const gigId = req.body.gigId || req.params.gigId;

//         // Check if gigId is provided
//         if (!gigId) {
//             return res.status(400).json({
//                 status: false,
//                 message: 'Gig ID is required'
//             });
//         }

//         // Find the draft gig with the provided gigId
//         const draftGig = await draftmodel.findOne({ _id: gigId, isActive: true });

//         // Check if draft gig exists
//         if (!draftGig) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Draft gig not found'
//             });
//         }

//         // Now, you can retrieve the details from draftGig and use them to create a new gig
//         const newGig = new gigsmodel({
//             jobTitle: draftGig.jobTitle,
//             jobLocation: draftGig.jobLocation,
//             streetAddress: draftGig.streetAddress,
//             workplaceType: draftGig.workplaceType,
//             // Similarly, retrieve other fields from draftGig
//             jobDescription: draftGig.jobDescription,
//             skills: draftGig.skills,
//             additionalRequirements: draftGig.additionalRequirements,
//             age: draftGig.age,
//             gender: draftGig.gender,
//             nationality: draftGig.nationality,
//             languages: draftGig.languages,
//             questions: draftGig.questions,
//             benefits: draftGig.benefits,
//             compensation: draftGig.compensation,
//             jobCurrency: draftGig.jobCurrency,
//             paymentType: draftGig.paymentType,
//             minPay: draftGig.minPay,
//             maxPay: draftGig.maxPay,
//             hiringCompany: draftGig.hiringCompany,
//             whyWorkWithUs: draftGig.whyWorkWithUs,
//             product: draftGig.product,
//             valueOfProduct: draftGig.valueOfProduct,
//             productDescription: draftGig.productDescription,
//             hiringCompanyDescription: draftGig.hiringCompanyDescription,
//             howLikeToApply: draftGig.howLikeToApply,
//             workSamples: draftGig.workSamples,
//             jobImage: draftGig.jobImage,
//             isActive: true,
//             type: "Posted"
//         });

//         // Save the new gig to the database
//         const savedGig = await newGig.save();


//         // Send success response with saved gig data
//         return res.status(201).json({
//             status: true,
//             message: "Draft Added Successfully",
//             data: savedGig,
//         });

//     } catch (error) {
//         // Log the error and send a 500 internal server error response
//         console.error("Error in postJobByDraft:", error);
//         return res.status(500).json({
//             status: false,
//             message: 'Server error'
//         });
//     }
// };



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
            workSamples, jobImage
        } = req.body;

        // Construct update object
        const updateFields = {
            jobTitle, jobLocation, streetAddress, workplaceType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage
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

// const editDraft = async (req, res) => {
//     try {
//         // const userId = req.body.userId || req.params.userId;
//         const gigId = req.body.gigId || req.params.gigId;

//         // /* Authentication */
//         // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//         // if (!authResult) {
//         //   return res.json({ status: false, msg: 'Authentication failed' });
//         // }
//         // /* Authentication */


//         const updateFields = new draftmodel({
//             jobTitle, jobLocation, streetAddress, workplaceType, jobType,
//             jobDescription, skills, additionalRequirements, age, gender,
//             nationality, languages, questions, benefits, compensation,
//             jobCurrency, paymentType, minPay, maxPay, hiringCompany,
//             whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
//             workSamples, jobImage,// isActive: true
//         } = req.body);

//         try {
//             await draftmodel.updateOne(
//                 { _id: new mongoose.Types.ObjectId(gigId) },
//                 { $set: updateFields }
//             );
//             res.json({
//                 message: "Updated successfully",
//                 status: true,
//                 data: updateFields,

//             });
//         } catch (err) {
//             res.json({ status: false, msg: err.message });
//         }
//     } catch (error) {
//         res.json({ status: false, msg: 'Error Occurred' });
//     }
// };
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
            workSamples, jobImage, // isActive: true if needed
        } = req.body;

        // Use a plain object for the fields to be updated
        const updateFields = {
            jobTitle, jobLocation, streetAddress, workplaceType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage, // Include isActive: true if updating this field as well
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

// const editJob = async (req, res) => {
//     try {
//         // const userId = req.body.userId || req.params.userId;
//         // const gigId = req.body.gigId || req.params.gigId;

//         /* Authentication (Uncomment and adjust as necessary)
//         const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//         if (!authResult) {
//           return res.status(401).json({ status: false, msg: 'Authentication failed' });
//         }
//         */

//         // Construct the updateFields object from the request body
//         const updateFields = new gigsmodel({
//             jobTitle, jobLocation, streetAddress, workplaceType, jobType,
//             jobDescription, skills, additionalRequirements, age, gender,
//             nationality, languages, questions, benefits, compensation,
//             jobCurrency, paymentType, minPay, maxPay, hiringCompany,
//             whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
//             workSamples, jobImage,// isActive: true
//         } = req.body);

//         // Perform the update
//         const updateResult = await gigsmodel.updateOne(
//             { _id: new mongoose.Types.ObjectId(gigId) }, // Ensure gigId is a valid ObjectId
//             { $set: updateResult }
//         );

//         if (updateResult.modifiedCount === 0) {
//             return res.json({ status: false, msg: 'No changes were made.' });
//         }

       
//             res.json({
//                 message: "Updated successfully",
//                 status: true,
//                 data: updateFields

//             });
     
//     } catch (err) {
//         console.error("Error in editJob:", err);
//         res.status(500).json({ status: false, msg: 'Error Occurred' });
//     }
// };
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

// const getBrandDraftJobsByID = async (req, res, next) => {
//     try {
//         const brandId = req.body.brandId || req.params.brandId;

//         /* Authentication (Uncomment and adjust as necessary)
//         const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//         if (!authResult) {
//           return res.status(401).json({ status: false, msg: 'Authentication failed' });
//         }
//         */

//         // Since we're using async/await, there's no need to use .then() and .catch() here.
//         const gig = await draftmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true }).sort({ created: -1 });

//         if (!gig) {
//             // If no gig is found, send a 404 not found response
//             return res.status(404).json({
//                 status: true,
//                 data: [] // Return an empty array for data
//             });
//         }

//         // If a gig is found, send it back in the response
//         res.json({
//             status: true,
//             data: [gig]
//         });

//     } catch (error) {
//         // Log the error and send a 500 internal server error response
//         console.error("Error fetching gig:", error);
//         res.status(500).json({
//             status: false,
//             message: 'Server error'
//         });
//     }
// };
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

// const getBrandPostedJobsByID = async (req, res, next) => {
//     try {
//         const brandId = req.body.brandId || req.params.brandId;

//         // // Authentication (Uncomment and adjust as necessary)
//         // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//         // if (!authResult) {
//         //   return res.status(401).json({ status: false, msg: 'Authentication failed' });
//         // }


//         // Since we're using async/await, there's no need to use .then() and .catch() here.
//         const gig = await gigsmodel.find({ brandId: new mongoose.Types.ObjectId(brandId), isActive: true }).sort({ created: -1 });

//         if (!gig) {
//             // If no gig is found, send a 404 not found response
//             return res.status(404).json({
//                 status: true,
//                 data: [] // Return an empty array for data
//             });

//         }

//         // If a gig is found, send it back in the response as an array of object
//         res.json({
//             status: true,
//             data: [gig] // Encapsulate the gig object within an array
//         });

//     } catch (error) {
//         // Log the error and send a 500 internal server error response
//         console.error("Error fetching gig:", error);
//         res.status(500).json({
//             status: false,
//             message: 'Server error'
//         });
//     }
// };


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

        // // Authentication (Uncomment and adjust as necessary)
        // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
        // if (!authResult) {
        //     return res.status(401).json({ 
        //         status: false, 
        //         msg: 'Authentication failed', 
        //         error: "Invalid or expired token" // Removed authResult.error, as it might not be available
        //     });
        // }

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

// const getAllJobs = async (req, res, next) => {
//     try {
//         const userId = req.body.userId || req.params.userId;

//         // Authentication (Uncomment and adjust as necessary)
//         const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//         if (!authResult) {
//             return res.status(401).json({ 
//                 status: false, 
//                 msg: 'Authentication failed', 
//                 error: authResult.error || "Invalid or expired token" // Provide detailed error message from the auth system if available
//             });
//         }

//         // Fetch all active gigs and drafts
//         const gigs = await gigsmodel.find({brandId:new mongoose.Types.ObjectId(userId), isActive: true }).sort({ createdAt: -1 });
//         const drafts = await draftmodel.find({brandId:new mongoose.Types.ObjectId(userId), isActive: true }).sort({ createdAt: -1 });

//         // Combine gigs and drafts into a single array and sort them by creation date, newest first
//         const jobs = [...gigs, ...drafts].sort((a, b) => b.createdAt - a.createdAt);

//         res.json({
//             status: true,
//             data: jobs
//         });
//     } catch (error) {
//         console.error("Error fetching all jobs:", error);
//         res.status(500).json({
//             status: false,
//             error: error
//         });
//     }
// };

// const getAllJobs = async (req, res, next) => {
//     try {
//         const userId = req.body.userId || req.params.userId;

//         // Authentication (Uncomment and adjust as necessary)
//         const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//         if (!authResult) {
//             return res.status(401).json({ status: false, msg: 'Authentication failed' });
//         }

//         // Fetch all active gigs and drafts
//         const gigs = await gigsmodel.find({ isActive: true }).sort({ createdAt: -1 });
//         const drafts = await draftmodel.find({ isActive: true }).sort({ createdAt: -1 });

//         // Combine gigs and drafts into a single array and sort them by creation date, newest first
//         const jobs = [...gigs, ...drafts].sort((a, b) => b.createdAt - a.createdAt);

//         res.json({
//             status: true,
//             data: jobs
//         });
//     } catch (error) {
//         console.error("Error fetching all jobs:", error);
//         res.json({
//             status: false,
//             error: error.message || "An error occurred while fetching all jobs."
//         });
//     }
// };



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

// const searchJobs = async (req, res, next) => {
//     // const userId = req.body.userId || req.params.userId;
//     /* Authentication (Uncomment and adjust as necessary)
//     const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//     if (!authResult) {
//       return res.status(401).json({ status: false, msg: 'Authentication failed' });
//     }
//     */
//     gigsmodel.find({ jobTitle:req.body.jobTitle,jobLocation:req.body.jobLocation,isActive: true }).sort({ created: -1 })

//         .then((response) => {
//             res.json({
//                 status: true,
//                 data: response
//             });
//         })
//         .catch((error) => {
//             res.json({
//                 status: false,
//             });
//         });
// };
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

        const TalentModel = talentType === 'kid' ? kidsmodel : adultmodel;

        // Update the talent document with the application details
        await TalentModel.findByIdAndUpdate(talentId, { $set: { gigId: gigId, isApplied: true, brandId: brandId } });

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

// async function saveNotification(brandId, talentId, gigId, brandNotificationMessage, talentNotificationMessage) {
//     try {
//         // Fetch details of brand and talent
//         const brand = await findUserById(brandId);
//         const talent = await findUserById(talentId);

//         // Determine user types for brand and talent
//         const brandType = await determineUserType(brandId);
//         const talentType = await determineUserType(talentId);
//         // Assuming the URL or file path is stored in the fileData property


//         // Create the notification document
//         const notification = new notificationmodel({
//             notificationType: 'Job Application',
//             brandId: brandId,
//             talentId: talentId,
//             gigId: gigId,
//             brandNotificationMessage: brandNotificationMessage,
//             talentNotificationMessage: talentNotificationMessage,
//             userType: talentType, // Use talent's user type for the notification
//             brandDetails: {
//                 _id: brand._id,
//                 _id: brand._id,
//                 brandName: brand.brandName,
//                 brandEmail: brand.brandEmail,
//                 logo: brand.logo,
//                 brandImage:brand.brandImage
//                 // Add other brand details as needed
//             },
//             talentDetails: {
//                 _id: talent._id,
//                 parentFirstName: talent.parentFirstName,
//                 parentLastName: talent.parentLastName,
//                 parentEmail:talent.parentEmail || talent.adultEmail,
//                 childFirstName: talent.childFirstName,
//                 childLastName: talent.childLastName,
//                 preferredChildFirstname : talent.preferredChildFirstname,
//                 preferredChildLastName : talent.preferredChildLastName,
//                 image: talent.image
//                 // Add other talent details as needed
//             }
//         });

//         // Save the notification document
//         const savedNotification = await notification.save();
//         console.log("Notification saved successfully", savedNotification);
//     } catch (error) {
//         console.error("Error saving notification:", error);
//     }
// }

// // Adjusted helper function to save a single notification
// async function saveNotification(brandId, talentId, gigId, brandNotificationMessage, talentNotificationMessage) {
//     try {
//         const userType = await determineUserType(talentId);
//         const notification = new notificationmodel({
//             notificationType: 'Job Application',
//             brandId: brandId,
//             talentId: talentId,
//             gigId: gigId,
//             brandNotificationMessage: brandNotificationMessage,
//             talentNotificationMessage: talentNotificationMessage,
//             userType: userType 
//         });
//         const savedNotification = await notification.save();
//         console.log("Notification saved successfully", savedNotification);
//     } catch (error) {
//         console.error("Error saving notification:", error);
//     }
// }


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








module.exports = {
    createJob, getAllJobs, getJobsByID, draftJob, getDraftJobsByID, getDraftJobs, postJobByDraft,
    editJob, editDraft, getBrandPostedJobsByID, getBrandDraftJobsByID, getPostedJobs,
    deleteJob, getAnyJobById,jobCount,searchJobs,applyJobs,readNotification,getBrandNotification,
    getTalentNotification,getCountNotification

};