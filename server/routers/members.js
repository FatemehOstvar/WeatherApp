const express = require("express");
const contr = require("../controllers/userController");
const userRouter = express.Router();
//
// userRouter.get('/messages',contr.viewMessagesWithData);
// userRouter.get('/newMessage',contr.showNewMessage);
// userRouter.post('/newMessage',...contr.createMessage);
// userRouter.get('/logout',contr.logOut)
module.exports = { userRouter };
