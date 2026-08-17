const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    relation: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["Family", "Friend", "Warden", "Security", "Hospital", "Helpline", "Other"],
      default: "Family",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmergencyContact",
  emergencyContactSchema
);