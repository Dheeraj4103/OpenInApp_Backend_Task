const SubTask = require("../models/SubTask");
const Task = require("../models/Task");
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const { updateTaskStatus } = require("./taskController");

exports.createSubtask = BigPromise(async (req, res, next) => {
    const task_id = req.params.task_id;

    if (!task_id) {
        return next(new CustomError("Please Enter a task Id.", 400));
    }

    const task = await Task.findById(task_id);

    if (!task) {
        return next(new CustomError("Task doesn't exists.", 401));
    }

    const subtask = await SubTask.create({
        task_id
    });

    task.subtasks.push(subtask.id);

    await task.save();

    await updateTaskStatus(task_id);

    res.status(200).json({
        success: true,
        subtask,
    })
});

exports.completeSubtask = BigPromise(async (req, res, next) => {
    const id = req.params.id;
    const task_id = req.params.task_id

    if (!id) {
        return next(new CustomError("Please enter a subtask id.", 400));
    }

    const task = await Task.findById(task_id);
    const subtask = await SubTask.findById(id);

    if (!subtask) {
        return next(new CustomError("Subtask doesn't exist.", 400));
    }

    subtask.status = 1;
    subtask.updated_at = Date.now();

    await subtask.save();
    
    await updateTaskStatus(subtask.task_id);

    res.status(200).json({
        success: true,
        subtask
    });
});

exports.deleteSubtask = BigPromise(async (req, res, next) => {
    const { task_id, id } = req.params;

    if (!task_id || !id) {
        return next(new CustomError("Please enter task id and subtask id", 400));
    }

   const subtask = await SubTask.findById(id);

    // await subtask.save();

    const task = await Task.findById(subtask.task_id);

    for (i in task.subtasks) {
        const subtask_id = task.subtasks[i].toString();
        if (subtask_id === id.toString()) {
            task.subtasks.splice(i, 1);
        }
    }

    await task.save();
    await SubTask.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        subtask,
        task
    });
})

exports.getSubtasks = BigPromise(async (req, res, next) => {
    const { task_id } = req.query;

    let subtasks;
    if (!task_id) {
        subtasks = await SubTask.find({});
    }
    else {
        subtasks = await SubTask.find({ task_id: task_id });
    }

    res.status(200).json({
        success: true,
        subtasks
    });
})