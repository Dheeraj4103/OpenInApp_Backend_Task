const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a Name'],
        maxlength: [40, 'Name should be under 40 characters']
    },
    phone_number: {
        type: Number,
        required: [true, 'Please provide a Phone Number'],
        unique: true
    },
    priority: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a Password']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}); 

// encrypt password before saving
userSchema.pre('save', async function (next) {
    // if password is not changed call the next function
    if (!this.isModified('password')) {
        return next();
    }

    // if password is changed, encrypt the password
    this.password = await bcrypt.hash(this.password, 10);
})

// validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function (userSendPassword) {
    return await bcrypt.compare(userSendPassword, this.password)
}

// create and return jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    });
}; 

// generate forgot password token (string)
// userSchema.methods.getForgotPasswordToken = function () {
//     // generate a long random string
//     const forgotToken = crypto.randomBytes(20).toString('hex');
//     this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex');

//     // time of expiry
//     this.forgotPasswordExpiry = Date.now() + (20 * 60 * 1000);

//     return forgotToken;
// }

module.exports = mongoose.model('User', userSchema);