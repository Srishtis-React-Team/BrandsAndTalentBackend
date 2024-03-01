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
const addGigs = async (req, res, next) => {
    try {
        console.log(req.body);
        const add_gigs = new gigsmodel({
            companyName: req.body.companyName,
            title: req.body.title,
            description: req.body.description,
            paymentStatus: req.body.paymentStatus,
            followers: req.body.followers,
            age: req.body.age,
            location: req.body.location,
            gender:req.body.gender,
            image:req.body.image,
            isActive: true
        });

        const response = await add_gigs.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: add_gigs,
        });
    } catch (error) {
        console.log(error);
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
const recentGigs = async (req, res, next) => {

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




module.exports = {
    addGigs, recentGigs

};