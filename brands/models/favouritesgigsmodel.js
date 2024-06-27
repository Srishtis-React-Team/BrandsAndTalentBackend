const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favouritejobSchema = new Schema({

    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brands', required: false },
    talentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: false },
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
    isActive: { type: Boolean, default: true },
    isFavourite:{type: Boolean, default: false},
    type:{type:String},
    brandDetails: {
        brandName: String,
        brandEmail: String,
        logo: Array,
        brandImage: Array,
    },
    talentDetails: {
        parentFirstName: String,
        parentLastName: String,
        parentEmail: String,
        childFirstName: String,
        childLastName: String,
        preferredChildFirstname:String,
        preferredChildLastName:String,
        image: Array,
        childGender:String,
        maritalStatus:String,
        childNationality:Array,
        languages:Array,
        childDob:String,
        childPhone:String,
        userType:String,
        isFavorite:String,
        adultEmail:String,
        parentMobileNo:String,
     


    },
    gigDetails:{
      
        jobTitle:String,
        jobLocation:String,
        streetAddress:String,
        employmentType:String,
        jobType:String,
        jobDescription:Array,
        skills:Array,
        age:String, 
        gender:Array,
        nationality:Array,
        questions:Array,
        benefits:Array,
        compensation: {
            type: Object,
            default: null
        },
        paymentType: {

            type: Object,
            default: null
    
        },
        minPay:String,
        maxPay:String,
        whyWorkWithUs:Array,
        product:String,
        valueOfProduct:String,
        productDescription:String,
        hiringCompanyDescription:Array,
        howLikeToApply:String,
        jobCurrency:String, 
        additionalRequirements:Array,
        languages:Array,
        hiringCompany:String,
        jobImage:Array,
        matched:String,
        workSamples:Array,
        type: {
            type: String,
            default: 'Posted'
        },
        country:String,
        state:String,
        city:String,
        lastDateForApply:Date,
        category:String,
        minAge:String,
        maxAge:String,
        instaMin:String,
        instaMax:String,
        tikTokMin:String,
        tikTokMax:String,
        linkedInMin:String,
        linkedInMax:String,
        fbMin:String,
        fbMax:String,
        twitterMin:String,
        twitterMax:String,
        youTubeMin:String,
        youTubeMax:String,
    },
    appliedOn: Date,
},
{
    timestamps: true
});

module.exports = mongoose.model('favouritesjob', favouritejobSchema);
