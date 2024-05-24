const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    notificationType: { type: String, required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brands', required: false },
    talentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: false },
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
    brandNotificationMessage: { type: String, required: false },
    talentNotificationMessage: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    read: { type: Boolean, default: false },
    userType:{type:String},
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
        image: Array
    },
    gigDetails:{
        jobTitle:String,
        category:String
    },
    appliedOn: Date,
},
{
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
