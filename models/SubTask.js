const mongoose = require("mongoose");

const subtaskSchema = new mongoose.Schema({
    task_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Task",
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    },
    deleted_at: {
        type: Date
    }
});

module.exports = mongoose.model("SubTask", subtaskSchema);