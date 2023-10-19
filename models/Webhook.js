const mongoose = require("mongoose")

const WebhookSchema = mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },

    provider: {
        type: String,
    },
    
    eventPayload: {
        type: Object,
    },

    webhookCreator: {
        type: String,
    },

    webhookCreatorDisplayName: {
        type: String,
    },

    webhookMentioned: {
        type: String,
    },

    webhookAssignedTo: {
        type: String,
    },

    webhookAssignedToDisplayName: {
        type: String,
    },

    webhookUpdatedBy: {
        type: String,
    },

    itemTitle: {
        type: String,
    },

    linkToEvent: {
        type: String,
    },

  },
  { timestamps: true }
)

module.exports = mongoose.model("webhook", WebhookSchema)
