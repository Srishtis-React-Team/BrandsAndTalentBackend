const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');

const professionmodel = require('../models/professionmodel');

/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const addProfession = async (req, res, next) => {
    try {
        console.log(req.body);
        const Add_Profession = new professionmodel({
            profession: req.body.profession,
            isActive: true
        });

        const response = await Add_Profession.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: Add_Profession,
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
const professionList = async (req, res, next) => {

    professionmodel.find({ isActive: true}).sort({ created: -1 })
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
    addProfession, professionList

};