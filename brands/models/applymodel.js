const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applyjobSchema = new Schema({

    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brands', required: false },
    talentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: false },
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
    selectedLevel:{type:String,default:'new'},
    isActive: { type: Boolean, default: true },
    read: { type: Boolean, default: false },
    isApplied:{type:String},
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
        childGender:Array,
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
        additionalRequirements:Array,
        languages:Array,
        hiringCompany:String,
        jobImage:Array,
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

module.exports = mongoose.model('Applyjobs', applyjobSchema);
