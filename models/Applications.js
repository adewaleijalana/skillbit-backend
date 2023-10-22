

const mongoose = require("mongoose")

const ApplicationSchema = new mongoose.Schema(
  {    
    job:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "job",

    },
    applicant:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",

    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("jobApplications", ApplicationSchema)


