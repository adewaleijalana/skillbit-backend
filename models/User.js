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
    isSuspended: {
      type: Boolean,
      default: false,
    },
    matchingContactEmail:{
      type:String,
    },
    withdrawalAddress:{
      type:String
    },
    pkEncrypt:{
      type:String
    },
    location:{
      type:String
    },
    pbKey:{
      type:String
    }

  },
  { timestamps: true }
)

module.exports = mongoose.model("user", UserSchema)


