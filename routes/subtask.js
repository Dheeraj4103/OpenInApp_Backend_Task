const express = require("express");
const { createSubtask, completeSubtask, deleteSubtask, getSubtasks } = require("../controllers/subtaskController");
const { isLoggedIn } = require("../middlewares/user");


const router = express.Router();

router.route("/:task_id/subtask/add").post(isLoggedIn, createSubtask);
router.route("/subtask/:id/complete").put(isLoggedIn, completeSubtask);
router.route("/subtask/:id/delete").delete(isLoggedIn, deleteSubtask);
router.route("/subtask/get").get(isLoggedIn, getSubtasks)

module.exports = router;