// routers/cities.js (example)
const express = require("express");
const router = express.Router();
const db = require("../db/queries");
const { authenticate } = require("../controllers/sharedController");

router.get("/", authenticate, async (req, res, next) => {
  try {
    const rows = await db.getAllCities(req.user.id);
    // rows is an array of object
    // [
    //    {"city_name": "Rasht"},
    //    {"city_name": "Tehran"}
    //                              ]
    const cities = rows.map((row) => row.city_name);
    res.json({ cities });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/:id/cities  (add a city for a user) - protected
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { city_name } = req.body;
    if (!city_name) return res.status(400).json({ msg: "city_name required" });
    await db.addUserCity(req.user.id, city_name.trim());
    res.status(201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
