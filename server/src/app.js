const express = require("express");
const {Router} = require("express");
const userRouter = require('./routes/userRouter');
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/', userRouter);

const port = 3003;
app.use(express.static("public"));
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})