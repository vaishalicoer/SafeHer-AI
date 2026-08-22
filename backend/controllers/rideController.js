const Ride = require("../models/Ride");

// ================= SAVE RIDE =================
exports.saveRide = async (req, res) => {
  try {
    const { photo, latitude, longitude, note } = req.body;

    if (!photo) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    const ride = await Ride.create({
      user: req.user._id,
      photo,
      latitude,
      longitude,
      note,
    });

    res.status(201).json({
      success: true,
      message: "Ride saved successfully",
      ride: {
        id: ride._id,
        user: ride.user,
        latitude: ride.latitude,
        longitude: ride.longitude,
        note: ride.note,
        createdAt: ride.createdAt,
      },
    });
  } catch (error) {
    console.error("Save ride error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET RIDE HISTORY =================
exports.getRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      user: req.user._id,
    })
      .select("-photo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    console.error("Get rides error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};