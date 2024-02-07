const app = require('./app');
require('dotenv').config();
const cron = require("node-cron")
const connectWithDB = require("./config/db");
const { updatePriority } = require('./controllers/taskController');
const { getAllUsers } = require('./controllers/userController');

// connect oto database
connectWithDB();

const corsOptions = {
    origin: 'http://localhost:3000/#/menu',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


      

cron.schedule('0 0 * * *', async () => {
    const expiredTasks = await updatePriority();
    const users = await getAllUsers();
    if (expiredTasks.length != 0) {
        client.calls
            .create({
                url: 'http://demo.twilio.com/docs/voice.xml',
                to: users[0].phone_number.toString(),
                from: "+16203613148"
            })
            .then(call => console.log(call.sid));
    }
});



app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));