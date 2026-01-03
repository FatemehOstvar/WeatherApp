const express = require("express");
const contr = require("../controllers/spectatorController");
const spectatorRouter = express.Router();
//
// spectatorRouter.get("/login", contr.viewLogIn);
spectatorRouter.post("/login", contr.logIn);
// spectatorRouter.get("/logout", contr.logOut);

spectatorRouter.post("/sign-up", ...contr.register);
//
// spectatorRouter.get("/joinClub", contr.ViewJoinClub);
// spectatorRouter.post("/join", contr.joinClub);
//
// spectatorRouter.get("/messages", contr.viewMessages);

spectatorRouter.get("/", contr.root);

module.exports = { spectatorRouter };
