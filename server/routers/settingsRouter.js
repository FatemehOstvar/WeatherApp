const express = require("express");
const contr = require("../controllers/settingsController");
const settingsRouter = express.Router();

// settingsRouter.get('/',contr.getSettings);
// settingsRouter.get('/newMessage',contr.showNewMessage);
// settingsRouter.post('/newMessage',...contr.createMessage);
// settingsRouter.post('/deleteMessage',contr.deleteMessage);
// settingsRouter.get('/logout',contr.logOut)

module.exports = { settingsRouter };
