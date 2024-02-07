const express = require("express");
const { createTask, getAllTask, deleteTask } = require("../controllers/taskController");
const { isLoggedIn } = require("../middlewares/user");


const router = express.Router();

router.route("/task/add").post(isLoggedIn, createTask);
router.route("/tasks").get(isLoggedIn, getAllTask);
router.route("/task/:id/delete").delete(isLoggedIn, deleteTask);

module.exports = router;