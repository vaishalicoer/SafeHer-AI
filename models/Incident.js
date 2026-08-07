const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Harassment",
        "Theft",
        "Suspicious Activity",
        "Stalking",
        "Other",
      ],
      default: "Other",
    },

    latitude: Number,

    longitude: Number,

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Incident", incidentSchema);