const mongoose = require("mongoose");

// Corrected the variable name to match your usage later in the userId field
const Schema = mongoose.Schema;

const authenticationSchema = new Schema({
    searchedKeyword: {
        type: String, 
    }, 
    isActive: {
        type: Boolean,
    },
    user_id: {
        type: Schema.Types.ObjectId, // Now correctly refers to the defined Schema variable
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['kids', 'adult'], // Indicates which collection to refer to
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('Keywords', authenticationSchema);
