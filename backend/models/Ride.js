const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    photo: {
      type: String,
      required: true,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);