const SOS = require("../models/SOS");
const User = require("../models/User");

exports.triggerSOS = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const existing = await SOS.findOne({
      user: req.user._id,
      status: "ACTIVE",
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An active SOS already exists.",
      });
    }

    const sos = await SOS.create({
      user: req.user._id,
      latitude,
      longitude,
    });

    await User.findByIdAndUpdate(req.user._id, {
      isSOSActive: true,
    });

    res.status(201).json({
      success: true,
      message: "SOS Triggered Successfully",
      sos,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

exports.cancelSOS = async (req, res) => {

  try {

    const sos = await SOS.findOne({
      user: req.user._id,
      status: "ACTIVE",
    });

    if (!sos) {

      return res.status(404).json({
        success: false,
        message: "No Active SOS Found",
      });

    }

    sos.status = "RESOLVED";
    sos.resolvedAt = new Date();

    await sos.save();

    await User.findByIdAndUpdate(req.user._id, {
      isSOSActive: false,
    });

    res.json({
      success: true,
      message: "SOS Cancelled",
      sos,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};

exports.getActiveSOS = async (req, res) => {

  try {

    const sos = await SOS.findOne({
      user: req.user._id,
      status: "ACTIVE",
    });

    res.json({
      success: true,
      sos,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};

exports.getHistory = async (req, res) => {

  try {

    const history = await SOS.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      history,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};