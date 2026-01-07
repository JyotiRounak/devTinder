const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async(req, res, next)=>{
  try{
  // read the token from request cookie
  const token = req.cookies.token;

  if(!token){
    throw new Error("Unauthorised access");
  }

  // validate the token
  const decodedtoken = jwt.verify(token, "devTinder@125#");
  // find the user
  const user = await User.findById(decodedtoken._id);
  if(!user){
    throw new Error("User not found");
  }
  req.user = user;
  next();
}
catch(error){
  res.status(400).send("Error: "+ error.message);
}
}

module.exports = { userAuth}