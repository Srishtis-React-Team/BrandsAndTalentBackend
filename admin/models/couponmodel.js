const mongoose = require("mongoose")
var schema = mongoose.Schema;


const authenticationSchema = new schema({

   
    code: {
        type: String, 
        
    }, 
    currency:{
        type:String
    },
    discountAmount:{
        type:Number
    },
    isActive: {
        type: Boolean
    },
    expiry:{
        type:Date
    },
    type:{
        type:String
    },
    subscriptionPlan:{
        type:String
    },
    planName:{
        type:String
    }
 
    

   
},
    {
        timestamps: true


    });
    module.exports = mongoose.model('Coupon', authenticationSchema);