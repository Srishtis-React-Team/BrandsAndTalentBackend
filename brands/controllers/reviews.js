const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');


const reviewsmodel = require('../models/reviewsmodel');

/**
 *********addReviews******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const addReviews = async (req, res, next) => {
    try {
        console.log(req.body);
        const addReviews = new reviewsmodel({
            reviewerDescription: req.body.reviewerDescription,
            reviewerTitle: req.body.reviewerTitle,
            reviewerDate: req.body.reviewerDate,
            initialLetter: req.body.initialLetter,
            rating: req.body.rating,
            reviewerName:req.body.reviewerName,
            isActive: true
        });

        const response = await addReviews.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: addReviews,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            message: "An Error Occurred"
        });
    }
};


/**
*********reviewList******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const reviewList = async (req, res, next) => {

    reviewsmodel.find({ isActive: true}).sort({ created: -1 })
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




module.exports = {
    addReviews, reviewList

};