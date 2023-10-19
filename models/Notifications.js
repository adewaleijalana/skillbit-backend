const mongoose = require("mongoose")

const Notifications = mongoose.Schema(
  {
    provider: {
      type: String,
    },
    payload: {
      type: Object,
    },
    webhookCreator: {
      type: String,
    },

    webhookMentioned: {
      type: String,
    },

    webhookAssignedTo: {
      type: String,
    },

    webhookUpdatedBy: {
      type: String,
    },

    itemTitle: {
      type: String,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("notifications", Notifications)
