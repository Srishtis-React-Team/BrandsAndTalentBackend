const mongoose = require("mongoose")
var schema = mongoose.Schema;


const authenticationSchema = new schema({

    planname: {
        type: String, 
        default: '',
       
    },
   
    gift: {
        type: String, default: '',
      
    },
    data: {
        type: Array, default: '',
        
    }, 
    isActive: {
        type: Boolean, 
        default: ''
       
    },
    price:{
        type:String, default: '',
       
    },
    period:{
        type:String, default: '',
       
    },
    plan_type_monthly:{
        type: Array
    },
    plan_type_annual:{
        type: Array
    },
    annualTotalAmount:{
        type:String
    },
    
    
   

   
},
    {
        timestamps: true


    });
    module.exports = mongoose.model('Subscription', authenticationSchema);