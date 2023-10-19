const mongoose = require("mongoose")

const ConnectionRequests = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    site: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("connectionrequests", ConnectionRequests)
