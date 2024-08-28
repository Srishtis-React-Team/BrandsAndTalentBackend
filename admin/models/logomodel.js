const mongoose = require('mongoose');

const logoSchema = new mongoose.Schema({
  image: [{
    id: mongoose.Schema.Types.ObjectId,
    url: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  }
});

const logomodel = mongoose.model('Logo', logoSchema);

module.exports = logomodel;
