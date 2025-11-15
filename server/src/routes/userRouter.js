
const { Router } = require("express");
const userController = require("../controllers/userController");

const userRouter = Router();


//replace with the real routes
userRouter.get("/", userController.getUsers);
userRouter.post('/',userController.sendSearchTerm);
userRouter.get("/new", userController.getNewUser);
userRouter.post("/new", userController.createNewUser);

module.exports = userRouter;
