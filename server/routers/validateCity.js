const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  // alert("trying to validate city");
  const city = (req.query.city || "").trim();
  if (!city)
    return res.status(400).json({ valid: false, msg: "city required" });

  const url =
    "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" +
    encodeURIComponent(city) +
    `?unitGroup=metric&include=current&contentType=json&key=${process.env.KEY}`;

  try {
    const r = await fetch(url);
    const text = await r.text();

    if (!r.ok) {
      return res.status(200).json({
        valid: false,
        status: r.status,
        msg: text.slice(0, 300),
      });
    }

    const data = JSON.parse(text);
    return res.json({
      valid: true,
      resolvedAddress: data.resolvedAddress,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
    });
  } catch (e) {
    return res.status(200).json({ valid: false, msg: "network/parse error" });
  }
});

module.exports = router;
