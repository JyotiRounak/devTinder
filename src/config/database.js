const mongoose = require('mongoose');

const connecttoDatabase= async()=>{
await mongoose.connect("mongodb+srv://jyoti_rounak:BlMDGUWxvSLb42uV@cluster0.rqwyytp.mongodb.net/devTinderDB")
}

module.exports = connecttoDatabase