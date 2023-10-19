const mongoose = require("mongoose")

const UserSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    contactEmail:{
      type:String,
      lowercase:true
    },
    profileSetup:{
      type:Boolean,
      default:false
    },
    jmlIssue:{
      type:String,
    },
    ndaRequestSent: {
      type: Boolean,
      default: false,
    },
    ndaSigned: {
      type: Boolean,
      default: false,
    },
    status:{
      type:String,
      default:'Pending'
    },
    currentStep:{
      type:Number,
      default:1,
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Onboard", UserSchema)
