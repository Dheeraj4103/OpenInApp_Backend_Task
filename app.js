const express = require('express');
var morgan = require('morgan');
// const cron = require("node-cron");
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const app = express();

// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
  
app.use(cors());

// morgan middleware
app.use(morgan("tiny"));

// cookie and fileuploader middleware
app.use(cookieParser());
// app.set("view engine", "ejs");

// import all routes
const user = require('./routes/user');
const task = require('./routes/task');
const subtask = require('./routes/subtask')

// router middleware
app.use('/api/v1', user);
app.use('/api/v1', task);
app.use('/api/v1', subtask);

app.get('/', (req, res) => {
    res.send("TO-DO list APIs")
})

module.exports = app;