const { logOut, showNewMessage, createMessage } = require("./sharedController");

const adminModel = require("../db/queries");

async function deleteMessage(req, res, next) {
  await adminModel.deleteMessage(req.body.messageId);
  res.redirect("/admin/messages");
}

async function viewMessagesWithData(req, res, next) {
  const contentR = await adminModel.getAllMessages();
  res.render("messages", {
    pageCss: "messages.css",
    messages: contentR,
    firstName: req.user.firstname,
    lastName: req.user.lastname,
    roleName: req.user.rolename,
  });
}

// viewMessagesWithData
module.exports = {
  createMessage,
  showNewMessage,
  viewMessagesWithData,
  deleteMessage,
  logOut,
};
