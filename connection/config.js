const mongoose = require("mongoose")
const express = require("express")
const app = express();
const bodyParser = require('body-parser')
const morgan = require('morgan');
const { consumers } = require("form-data");





// Replace the following with your MongoDB connection string
//const url = 'mongodb://eduoskus:Dreamz2023@13.234.177.61:27017/eduoskus';
//const url='mongodb://127.0.0.1:27017/brandsandtalent'
const url='mongodb://127.0.0.1:27017/brandsandtalentlive'
mongoose.connect(url, {  //change localhost:27017 
    useNewUrlParser: true, 
    useUnifiedTopology: true
})


const db = mongoose.connection;
db.on('error', console.error.bind(console, "Error connecting to db"));

db.once('open', function () {
    console.log("connected to DB");
})

module.exports = db;
// connect with db
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(morgan('dev'))

