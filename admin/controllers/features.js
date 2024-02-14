const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');

const featuresmodel = require('../models/featuresmodel');

/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const addFeatures = async (req, res, next) => {
    try {
        console.log(req.body);
        const Add_Features = new featuresmodel({
            features: req.body.features,
            isActive: true
        });

        const response = await Add_Features.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: Add_Features,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            message: "An Error Occurred"
        });
    }
};


/**
*********pricingList******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const getFeatures = async (req, res, next) => {

    featuresmodel.find({ isActive: true}).sort({ created: -1 })
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
    addFeatures, getFeatures

};