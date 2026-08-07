const User = require("../models/User");
const EmergencyContact = require("../models/EmergencyContact");
const SOS = require("../models/SOS");
const Incident = require("../models/Incident");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");

    const totalContacts = await EmergencyContact.countDocuments({
      user: userId,
    });

    const activeSOS = await SOS.findOne({
      user: userId,
      status: "ACTIVE",
    });

    const recentIncidents = await Incident.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      dashboard: {
        user,
        totalContacts,
        activeSOS,
        recentIncidents,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};