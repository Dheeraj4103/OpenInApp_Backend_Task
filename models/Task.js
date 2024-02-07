const mongoose = require("mongoose"); 
const SubTask = require("./SubTask");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        default: "TODO"
    },
    due_date: {
        type: Date,
        required: true
    },
    priority: {
        type: Number,
        required: true
    },
    subtasks: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "SubTask",
        }
    ]
    
});



module.exports = mongoose.model("Task", taskSchema);