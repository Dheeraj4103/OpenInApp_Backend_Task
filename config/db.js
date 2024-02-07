const mongoose = require('mongoose');

const connectWithDb = () => {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(console.log("Connected to MongoDB"))
        .catch(error => {
            console.log('DB connection Issues');
            console.log(error);
            process.exit(1);
        })
};

module.exports = connectWithDb;