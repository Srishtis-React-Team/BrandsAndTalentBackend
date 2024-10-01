const mongoose = require("mongoose")
var schema = mongoose.Schema;

const couponSchema = new mongoose.Schema({
    code: String,
    currency: String,
    discountAmount: Number,
    isActive: Boolean,
    expiry: Date,
    type: String,
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }
 });
var authenticationSchema = new schema({
    position: {
        type: String
    },
    brandName: {
        type: String
    },
    brandEmail: {
        type: String
    },
    brandPassword: {
        type: String
    },
    confirmPassword: {
        type: String
    },


    isActive:
    {
        type: Boolean

    },
    isVerified:
    {
        type: Boolean

    },
    userType: {
        type: String,

    },
    otp: {
        type: String
    },
    brandPhone: {
        type: String
    },
    brandZipCode: {
        type: String
    },
    howHearAboutUs: {
        type: String
    },
    address: {
        type: String
    },
    logo: {
        type: Array
    },

    resetPasswordToken:
    {
        type: String,

    },
    googleId:

    {
        type: String,

    },
    facebookId:
    {
        type: String,

    },
    postJobCount: {
        type: String,
    },
    draftCount: {
        type: String,
    },
    campaignCount: {
        type: String,
    },
    planName: {
        type: String,
    },
    fcmToken: {
        type: String,
    },
    brandImage: {
        type: Array,
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    inActive:
    {
        type: Boolean,
        default: true

    },
    adminApproved: {
        type: Boolean,
        default: false
    },
    userName: {
        type: String
    },
    profileImage: {
        type: Array
    },
    websiteLink: {
        type: String
    },
    publicUrl: {
        type: String
    },
    yourFullName: {
        type: String
    },
    brandType: {
        type: String
    },
    brandCountry: {
        type: String
    },
    brandState: {
        type: String
    },
    brandCity: {
        type: String
    },
    brandWebsite: {
        type: String
    },
    linkedinUrl: {
        type: String
    },
    facebookUrl: {
        type: String
    },
    twitterUrl: {
        type: String
    },
    aboutBrand: {
        type: String
    },
    whyWorkWithUs: {
        type: String
    },
    profileApprove: {
        type: Boolean,
        default: true
    },
    isSubscribed:{
        type:Boolean,
        default:false
     },
     coupon: [couponSchema], // Array of coupon objects
     paid:{
        type:Boolean,
        default:false
       },

    resetPasswordExpires: Date,
    created: { type: Date, default: Date.now },
    transactionDate: {
        type: Date
     },
     paymentStatus: {
        type: String
     },
     paymentCurreny: {
        type: String
     },
     paymentAmount: {
        type: Number
     },
     paymentPeriod: {
        type: String
     },
     paymentPlan: {
        type: String
     },
     subscriptionType: {
        type: String
     },
     planName: {
        type: String,
        default: 'Basic'
     },
     transId:{
        type:String
     },
     subscriptionPlan:{
        type:String
     },
     accountBlock:{
        type:Boolean
     },
     gift:[{
        receiversFirstName: String,
        receiverEmail: String,
        announceDate: Date,
        message:String,
        subscriptionPlan:String,
        planName:String,
        expiry:Date,
        transId:String,
        transactionDate:Date, 
        paymentStatus:String, 
        paymentCurreny:String, 
        paymentAmount:Number, 
        paymentPeriod:String, 
        paymentPlan:String,
        coupon:String,
        code:String
       
    }],
  


},
    {
        timestamps: true


    });
module.exports = mongoose.model('Brands', authenticationSchema);
