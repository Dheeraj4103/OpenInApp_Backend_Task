const Task = require("../models/Task");
const SubTask = require("../models/SubTask");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");

exports.createTask = BigPromise(async (req, res, next) => {
  const { title, description, due_date } = req.body;

  if (!title || !description || !due_date) {
    return next(
      new CustomError("Title, Description and Due Date is required.", 400)
    );
  }
  const daysDiff = parseInt(
    (new Date(due_date).getDate() - new Date().getDate()) /
      (1000 * 60 * 60 * 24)
  );
  let priority = -1;
  if (daysDiff === 0) {
    priority = 0;
  } else if (daysDiff === 1 || daysDiff === 2) {
    priority = 1;
  } else if (daysDiff === 3 || daysDiff === 4) {
    priority = 2;
  } else if (daysDiff > 4) {
    priority = 3;
  }
  const task = await Task.create({
    title,
    description,
    due_date,
    priority,
  });

  res.status(200).json({
    success: true,
    task,
  });
});

exports.getAllTask = BigPromise(async (req, res, next) => {
    const { priority, due_date } = req.query;
    
    let tasks = await Task.find({});
    if (priority && !due_date) {
        tasks = await Task.find({priority: parseInt(priority)}).limit(10);
    } else if (priority && due_date) {
        tasks = await Task.find({priority: parseInt(priority), due_date: new Date(due_date)}).limit(10);
    } else if (due_date && !priority) {
        tasks = await Task.find({due_date: new Date(due_date)}).limit(10);
    }

    res.status(200).json({
        success: true,
        tasks,
    });
});

exports.deleteTask = BigPromise(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  for (i in task.subtasks) {
    await SubTask.findByIdAndDelete(task.subtasks[i]);
  }
  await Task.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "Task Deleted",
  });
});

exports.updateTaskStatus = async (task_id) => {
  let allSubtaskDone = true;
  const task = await Task.findById(task_id);
  for (i in task.subtasks) {
    const subtask_id = task.subtasks[i];
    const subtask = await SubTask.findById(subtask_id);
    if (subtask.status === 0) {
      allSubtaskDone = false;
      break;
    }
  }

  task.status = allSubtaskDone ? "DONE" : "IN_PROGRESS";

  await task.save();
};

exports.updatePriority = async () => {
  let expiredTask = [];

  const tasks = await Task.find({});

  for (i in tasks) {
    const task = tasks[i];
    const due_date = task.due_date;
    const daysDiff = parseInt(
      (new Date(due_date).getDate() - new Date().getDate()) /
        (1000 * 60 * 60 * 24)
    );
    let priority = -1;
    if (daysDiff === 0) {
      priority = 0;
    } else if (daysDiff === 1 || daysDiff === 2) {
      priority = 1;
    } else if (daysDiff === 3 || daysDiff === 4) {
      priority = 2;
    } else {
      priority = 3;
    }
    if (daysDiff === -1) {
      expiredTask.push(tasks[i]);
    }
    await Task.findByIdAndUpdate(task[i]._id, {priority: priority})
  }
  return expiredTask;
}
