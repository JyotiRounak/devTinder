const mongoose = require('mongoose');

const connecttoDatabase= async()=>{
await mongoose.connect(process.env.DB_CONNECTION)
}

module.exports = connecttoDatabase