const mongoose = require("mongoose");

const journeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guardianContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyContact",
    },
    startLocation: {
      latitude: Number,
      longitude: Number,
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "ALERT_TRIGGERED"],
      default: "ACTIVE",
    },
    lastMovedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Journey", journeySchema);