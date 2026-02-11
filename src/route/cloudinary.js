const express = require("express");
const { userAuth} = require("../middleware/auth");
const cloudinary = require("../utils/cloudinary");
const profileRouter = express.Router();

profileRouter.post("/sign-upload", userAuth, async(req, res)=>{
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `profile-images/${req.user._id}`;

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  });
});



module.exports = profileRouter;