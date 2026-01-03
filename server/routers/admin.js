const express = require("express");
const contr = require("../controllers/adminController");
const adminRouter = express.Router();
//
// adminRouter.get('/messages',contr.viewMessagesWithData);
// adminRouter.get('/newMessage',contr.showNewMessage);
// adminRouter.post('/newMessage',...contr.createMessage);
// adminRouter.post('/deleteMessage',contr.deleteMessage);
// adminRouter.get('/logout',contr.logOut)

module.exports = { adminRouter };
