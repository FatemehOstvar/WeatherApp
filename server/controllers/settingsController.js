const { authenticate } = require("./sharedController");
const db = require("../db/queries");

const settings = [
  authenticate,
  async (req, res, next) => {
    // I assume req.user means the user has access .
    // TODO make sure this is the case.
    const settings = await db.getSettings();
    res.json({
      username: req.user.name,
      settings: settings,
    });
  },
];

exports.modules = { settings };
