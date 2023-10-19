const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
  {
    lastName: {
      type: String,
      lowercase: true,
    },
    firstName: {
      type: String,
      lowercase: true,
    },
    title: {
      type: String,
    },
    paymentProfileUrl: {
      type: String,
      lowercase: true,
    },
    twitterProfileUrl: {
      type: String,
      lowercase: true,
    },
    facebookProfileUrl: {
      type: String,
      lowercase: true,
    },
    githubProfileUrl: {
      type: String,
      lowercase: true,
    },
    linkedinProfileUrl: {
      type: String,
      lowercase: true,
    },
    keybase: {
      type: String,
    },
    calendlyProfileUrl: {
      type: String,
      lowercase: true,
    },
    sjultraEmail:{
      type: String,
      lowercase: true,
    },
    profileSetup: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    matchingContactEmail:{
      type:String,
    },

  },
  { timestamps: true }
)

module.exports = mongoose.model("user", UserSchema)


