

const mongoose = require("mongoose")

const JobsSchema = new mongoose.Schema(
  {
    
    title:{
      type: String,
      lowercase: true,
    },
    
    description: {
      type: String,
      lowercase: true,
    },

    duration: {
      type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    associatedMultiSig:{
        type:String,
    },
    assignee:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    payment:{
        type:Number  
    },
    hours:{
        type:Number
    },
    duration:{
        type:Number
    },
    skills:[String]
    ,
    roleRequired: {
      type: String,
      default: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("jobs", JobsSchema)


