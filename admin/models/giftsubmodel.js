const mongoose = require("mongoose");
const { subscriptionPlan } = require("../../users/controllers/kids");
const { captureRejectionSymbol } = require("form-data");


const Schema = mongoose.Schema;

const authenticationSchema = new Schema({
    senderName: {
        type: String, 
    },
   
    isActive: {
        type: Boolean,
    },
    email:{
        type:String
    },
    user_id: {
        type: Schema.Types.ObjectId,
        refPath: 'userType', // Dynamically reference the model
      },
      userType: {
        type: String, // To store the model type (kids, adult, brands)
        enum: ['Kids', 'Adult', 'Brands'],
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
        paymentCurrency:String, 
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

module.exports = mongoose.model('GiftSubscriptions', authenticationSchema);
