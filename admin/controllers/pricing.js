const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authentication = require('../../middleware/auth');
const auth = new authentication;
const async = require('async');
const crypto = require('crypto');
const moment = require('moment');

const pricingmodel = require('../models/pricingmodel');
const brandspricingmodel = require("../models/brandspricingmodel");

/**
 *********brandsRegister******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
const addPricing = async (req, res, next) => {
    try {
        console.log(req.body);
        const Add_Pricing = new pricingmodel({
            planname: req.body.planname,
            gift: req.body.gift,
            price: req.body.price,
            period:req.body.period,
            data:req.body.data,
            plan_type_monthly:req.body.plan_type_monthly,
            plan_type_annual:req.body.plan_type_annual,
            isActive: true
        });

        const response = await Add_Pricing.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: Add_Pricing,
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
const pricingList = async (req, res, next) => {

    pricingmodel.find({ isActive: true}).sort({ created: -1 })
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
 *********addBrandsPricing******
 * @param {*} req from user
 * @param {*} res return data
 * @param {*} next undefined
 */
 const addBrandsPricing = async (req, res, next) => {
    try {
        console.log(req.body);
        const Add_Pricing = new brandspricingmodel({
            planname: req.body.planname,
            gift: req.body.gift,
            price: req.body.price,
            period:req.body.period,
            data:req.body.data,
            plan_type_monthly:req.body.plan_type_monthly,
            plan_type_annual:req.body.plan_type_annual,
            isActive: true
        });

        const response = await Add_Pricing.save();

        return res.json({
            message: "Added Successfully",
            status: true,
            data: Add_Pricing,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            message: "An Error Occurred"
        });
    }
};


/**
*********brandsPricingList******
* @param {*} req from user
* @param {*} res return data
* @param {*} next undefined
*/
const brandsPricingList = async (req, res, next) => {

    brandspricingmodel.find({ isActive: true}).sort({ created: -1 })
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
    addPricing, pricingList,addBrandsPricing,brandsPricingList

};