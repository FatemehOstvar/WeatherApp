const { logOut, createMessage, showNewMessage } = require("./sharedController");

const userModel = require("../db/queries");

async function viewMessagesWithData(req, res, next) {
  const contentR = await userModel.getAllMessages();
  console.log(contentR);
  res.render("messages", {
    pageCss: "messages.css",
    messages: contentR,
    firstName: req.user.firstname,
    lastName: req.user.lastname,
    roleName: req.user.role,
  });
}

module.exports = {
  createMessage,
  viewMessagesWithData,
  logOut,
  showNewMessage,
};
