const mongoose = require("mongoose")

const ErrExceptions = mongoose.Schema(
  {
    errObject: {
      type: String,
    },
    errResponse: {
      type: String,
    },
    errData: {
      type: String,
    },
    errSource: {
      type: String,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("errexceptions", ErrExceptions)
