const mongoose = require("mongoose")

const AuditSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    type: {
      type: String,
    },

    description: {
      type: String,
    },

    provider: {
      type: String,
    },

    userInsights: {
      deviceID: {
        type: String,
      },

      deviceData: {
        type: String,
      },

      location: {
        type: {
          type: String,
          enum: ["Point"],
        },
      },

      timezone: {
        type: String,
      },

      country: {
        type: String,
      },

      city: {
        type: String,
      },

      region: {
        type: String,
      },
    },

    webhook: {
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
    
      linkToEvent:{
        type:String
      }
    
    }
  
  
  },{timestamps:true});
  
  module.exports = mongoose.model('applogs', AuditSchema);
  
  
