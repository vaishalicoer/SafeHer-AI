const Journey = require("../models/Journey");

exports.startJourney = async (req, res) => {
  try {
    const { latitude, longitude, guardianContact } = req.body;

    const journey = await Journey.create({
      user: req.user._id,
      guardianContact,
      startLocation: { latitude, longitude },
      currentLocation: { latitude, longitude },
    });

    res.status(201).json({ success: true, journey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { journeyId, latitude, longitude } = req.body;

    const journey = await Journey.findOneAndUpdate(
      { _id: journeyId, user: req.user._id, status: "ACTIVE" },
      {
        currentLocation: { latitude, longitude },
        lastMovedAt: Date.now(),
      },
      { new: true }
    );

    if (!journey) {
      return res.status(404).json({ success: false, message: "Journey not found" });
    }

    res.status(200).json({ success: true, journey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.endJourney = async (req, res) => {
  try {
    const { journeyId } = req.body;

    const journey = await Journey.findOneAndUpdate(
      { _id: journeyId, user: req.user._id },
      { status: "COMPLETED", endedAt: Date.now() },
      { new: true }
    );

    if (!journey) {
      return res.status(404).json({ success: false, message: "Journey not found" });
    }

    res.status(200).json({ success: true, journey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getActiveJourney = async (req, res) => {
  try {
    const journey = await Journey.findOne({
      user: req.user._id,
      status: "ACTIVE",
    });

    res.status(200).json({ success: true, journey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};