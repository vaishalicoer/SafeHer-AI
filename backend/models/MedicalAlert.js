const mongoose = require("mongoose");

const medicalAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    latitude: Number,
    longitude: Number,
    note: {
      type: String,
      default: "Medical help needed",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalAlert", medicalAlertSchema);