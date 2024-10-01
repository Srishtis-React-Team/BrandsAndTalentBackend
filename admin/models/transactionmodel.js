const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transId: { type: String },
    type: { type: String },
    verifyId: { type: mongoose.Schema.Types.ObjectId },
    isActive: { type: Boolean, default: true },
    email: { type: String },
    senderName:{type:String},
    coupon:{type:String},
    paymentStatus:{type:String}, 
    
});

const transactionmodel = mongoose.model('Transaction', transactionSchema);

module.exports = transactionmodel;