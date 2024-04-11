const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');


const gigsmodel = require('../models/gigsmodel');
const draftmodel = require("../models/draftmodel");

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
    // const userId = req.body.userId || req.params.userId;
    /* Authentication (Uncomment and adjust as necessary)
    const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
    if (!authResult) {
      return res.status(401).json({ status: false, msg: 'Authentication failed' });
    }
    */
    gigsmodel.find({ isActive: true }).sort({ created: -1 })

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
        // const userId = req.body.userId || req.params.userId;
        const gigId = req.body.gigId || req.params.gigId;

        // /* Authentication */
        // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
        // if (!authResult) {
        //   return res.json({ status: false, msg: 'Authentication failed' });
        // }
        // /* Authentication */


        const updateFields = new draftmodel({
            jobTitle, jobLocation, streetAddress, workplaceType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage,// isActive: true
        } = req.body);

        try {
            await draftmodel.updateOne(
                { _id: new mongoose.Types.ObjectId(gigId) },
                { $set: updateFields }
            );
            res.json({
                message: "Updated successfully",
                status: true,
                data: updateFields,

            });
        } catch (err) {
            res.json({ status: false, msg: err.message });
        }
    } catch (error) {
        res.json({ status: false, msg: 'Error Occurred' });
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
        // const userId = req.body.userId || req.params.userId;
        // const gigId = req.body.gigId || req.params.gigId;

        /* Authentication (Uncomment and adjust as necessary)
        const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
        if (!authResult) {
          return res.status(401).json({ status: false, msg: 'Authentication failed' });
        }
        */

        // Construct the updateFields object from the request body
        const updateFields = new gigsmodel({
            jobTitle, jobLocation, streetAddress, workplaceType, jobType,
            jobDescription, skills, additionalRequirements, age, gender,
            nationality, languages, questions, benefits, compensation,
            jobCurrency, paymentType, minPay, maxPay, hiringCompany,
            whyWorkWithUs, product, valueOfProduct, productDescription, hiringCompanyDescription, howLikeToApply,
            workSamples, jobImage,// isActive: true
        } = req.body);

        // Perform the update
        const updateResult = await gigsmodel.updateOne(
            { _id: new mongoose.Types.ObjectId(gigId) }, // Ensure gigId is a valid ObjectId
            { $set: updateFields }
        );

        if (updateResult.modifiedCount === 0) {
            return res.json({ status: false, msg: 'No changes were made.' });
        }

       
            res.json({
                message: "Updated successfully",
                status: true,
                data: updateFields

            });
     
    } catch (err) {
        console.error("Error in editJob:", err);
        res.status(500).json({ status: false, msg: 'Error Occurred' });
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
        // const userId = req.body.userId || req.params.userId;

        // // Authentication (Uncomment and adjust as necessary)
        // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
        // if (!authResult) {
        //   return res.status(401).json({ status: false, msg: 'Authentication failed' });
        // }

        const gigs = await gigsmodel.find({ isActive: true }).sort({ createdAt: -1 }); // Sorting gigs by creation date, newest first
        const drafts = await draftmodel.find({ isActive: true }).sort({ createdAt: -1 }); // Sorting drafts by creation date, newest first

        // Combine gigs and drafts into a single array and sort them by creation date, newest first
        const jobs = [...gigs, ...drafts].sort((a, b) => b.createdAt - a.createdAt);

        res.json({
            status: true,
            data: jobs
        });
    } catch (error) {
        res.json({
            status: false,
            error: error.message
        });
    }
};

// const getAllJobs = async (req, res, next) => {
//     try {
//         // const userId = req.body.userId || req.params.userId;

//         // // Authentication (Uncomment and adjust as necessary)
//         // const authResult = await auth.CheckAuth(req.headers["x-access-token"], userId);
//         // if (!authResult) {
//         //   return res.status(401).json({ status: false, msg: 'Authentication failed' });
//         // }

//         const gigs = await gigsmodel.find({ isActive: true }).sort({ created: -1 });
//         const drafts = await draftmodel.find({ isActive: true }).sort({ created: -1 });

//         // Combine gigs and drafts into a single array
//         const jobs = [...gigs, ...drafts];

//         res.json({
//             status: true,
//             data: jobs
//         });
//     } catch (error) {
//         res.json({
//             status: false,
//             error: error.message
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
        let job = await gigsmodel.findOne({ _id: gigId, isActive: true }).sort({ createdAt: -1 });

        // If not found in gigsmodel, try to find it in draftmodel
        if (!job) {
            job = await draftmodel.findOne({ _id: gigId, isActive: true }).sort({ createdAt: -1 });
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




module.exports = {
    createJob, getAllJobs, getJobsByID, draftJob, getDraftJobsByID, getDraftJobs, postJobByDraft,
    editJob, editDraft, getBrandPostedJobsByID, getBrandDraftJobsByID, getPostedJobs,
    deleteJob, getAnyJobById

};