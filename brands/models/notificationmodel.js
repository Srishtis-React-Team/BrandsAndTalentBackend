const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    notificationType: { type: String, required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brands', required: false },
    talentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: false },
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
    brandNotificationMessage: { type: String, required: false },
    talentNotificationMessage: { type: String, required: false },
    notificationMessage: { type: String },
    isActive: { type: Boolean, default: true },
    read: { type: Boolean, default: false },
    userType: { type: String },
    isReport:{type: Boolean, default: false},
    profileApprove: { type: Boolean, default: false },
    adminApproved: { type: Boolean, default: false },
    reviewApproved: { type: String, default: 'Approved' },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: false },
    newPlan:{type:String},
    status: {
        type: String,
        default: 'Pending'
    },
    brandDetails: {
        brandName: String,
        brandEmail: String,
        logo: Array,
        brandImage: Array,
        oldPlan:String

    },
    reviewerDetails:{
        
        reviewerId:String,
        email:  String,
        name:  String,
        image:  String,
       

    },
    talentDetails: {
        oldPlan:String,
        parentFirstName: String,
        parentLastName: String,
        parentEmail: String,
        email: String,
        talentId: String,
        childFirstName: String,
        childLastName: String,
        preferredChildFirstname: String,
        preferredChildLastName: String,
        image: Array,
        verificationId: Array,
        publicUrl: String,
        profession: Array,
        relevantCategories: Array,
        childGender: String,
        childNationality: Array,
        childEthnicity: String,
        languages: Array,
        childDob: String,
        childLocation: String,
        childCity: String,
        childAboutYou: Array,
        cv: Array,
       // videosAndAudios: Array,
        features: Array,
        portfolio: Array,
        verificationId: Array,
        idType: String,
        bodyType: String,
        industry: String,
        isFavorite: Boolean,
        bookJob: String,
        rating: String,
        image: { type: Object, default: null },
        services: Array,
        reviews: Array,
        maritalStatus: String,
        age: Number,
        profileStatus: Boolean,
        applications: [{
            gigId: mongoose.Schema.Types.ObjectId,
            isApplied: Boolean,
            brandId: mongoose.Schema.Types.ObjectId,
            appliedDate: { type: Date, default: Date.now },
            selectedLevel: { type: String, default: 'new' },
        }],
        videoList:[String],
         audioList:[String],
       // videoAudioUrls: [String],
        noOfJobsCompleted: String,
        averageStarRatings: String,
        planName: String
    },

    gigDetails: {
        lastDateForApply: Date,
        jobTitle: String,
        category: String,
        employmentType: String,
        minAge: String,
        maxAge: String,
        instaMin: String,
        instaMax: String,
        tikTokMin: String,
        tikTokMax: String,
        linkedInMin: String,
        linkedInMax: String,
        fbMin: String,
        fbMax: String,
        twitterMin: String,
        twitterMax: String,
        youTubeMin: String,
        youTubeMax: String,
    },
    appliedOn: Date,
    read: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Notification', notificationSchema);
