const MedicalAlert = require("../models/MedicalAlert");

exports.triggerMedicalAlert = async (req, res) => {
  try {
    const { latitude, longitude, note } = req.body;

    const alert = await MedicalAlert.create({
      user: req.user._id,
      latitude,
      longitude,
      note: note || "Medical help needed",
    });

    res.status(201).json({ success: true, alert });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.resolveMedicalAlert = async (req, res) => {
  try {
    const alert = await MedicalAlert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "RESOLVED" },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: "Alert not found" });
    }

    res.status(200).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMedicalHistory = async (req, res) => {
  try {
    const alerts = await MedicalAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};