const User = require('../models/User');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');

exports.signup = BigPromise(async (req, res, next) => {

    const { name, phone_number, priority, password } = req.body;
    console.log({ name, phone_number, priority, password })
    if (!phone_number || !name || !password || priority === null) {
    console.log({ name, phone_number, priority, password })

        return next(new CustomError('Name, Phone Number and Password is required.', 400));
    }

    // create user
    const user = await User.create({
        name,
        phone_number,
        priority,
        password,
    });

    cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
    const { phone_number, password } = req.body;

    // check email or password are present or not
    if (!phone_number || !password) {
        return next(new CustomError("Please Provide phone and password.", 400));
    }

    // get user from db
    // select("+password") is used because by default password is false
    const user = await User.findOne({ phone_number: phone_number }).select("+password");

    // if user is not there
    if (!user) {
        return next(new CustomError("Email or password doesn't exist.", 400));
    }
    
    // check if password is correct or not
    const isPasswordCorrect = await user.isValidatedPassword(password);

    // return status code 400 saying incorrect password
    if (!isPasswordCorrect) {
        return next(new CustomError("Phone or password doesn't exist.", 400));
    }

    // generate token for user and 
    cookieToken(user, res);

});

exports.getAllUsers = async () => {
    const users = await User.find({}).sort({ priority: 1 });

    return users;
}

// exports.logout = BigPromise(async (req, res, next) => {
//     // make the cookie with name token as null and change the expire value to current time
//     res.cookie('token', null, {
//         expires: new Date(Date.now()),
//         httpOnly: true
//     });

//     // send a json message of successful logou t
//     res.status(200).json({
//         success: true,
//         message: "Logedout Successfully"
//     });
// })

// exports.forgotPassword = BigPromise(async (req, res, next) => {
//     const { email } = req.body;

//     // check if email is empty or not
//     if (!email) {
//         return next(new CustomError("Please enter an email.", 400));
//     }

//     // get the user
//     const user = await User.findOne({ email: email });

//     // check if user exist or not
//     if (!user) {
//         return next(new CustomError("Email not found.", 400));
//     }

//     // generate forgot password token
//     const forgotToken = await user.getForgotPasswordToken();

//     await user.save({ validateBeforeSave: false });

//     // make a url to grab that forgot token
//     const myUrl = `${req.protocol}://${req.get("host")}/password/reset/${forgotToken}`;

//     const message = `Copy paste this link in your url and hit enter \n\n ${myUrl}`;
//     // console.log(message);
//     try {
//         await mailHelper({
//             email: user.email,
//             subject: "Annapurna - Password Reset Email",
//             text : message
//         });

//         res.status(200).json({
//             success: true,
//             message: "Email send successfully"
//         })
//     } catch (error) {
//         user.forgotPasswordToken = undefined;
//         user.forgotPasswordExpiry = undefined;
//         await user.save({ validateBeforeSave: false });

//         return next(new CustomError(error.message, 500));
//     }
// });

// exports.passwordReset = BigPromise(async (req, res, next) => {
//     // get the token from the params
//     const token = req.params.token;
//     console.log(token);
//     // encrypt the token
//     const encryptedToken = crypto
//         .createHash('sha256')
//         .update(token)
//         .digest('hex');
    
//     // get the user, whose token expiry is in future
//     const user = await User.findOne({
//         forgotPasswordToken: encryptedToken,
//         forgotPasswordExpiry: { $gt: Date.now() }
//     });

//     // if we don't find any user
//     if (!user) {
//         return next("Token is invalid or is Expired.", 400);
//     }

//     // If user is valid then reset the password
//     // check if both password are same
//     if (req.body.password !== req.body.confirmPassword) {
//         return next("Password and Confirm Password do not match.", 400);
//     }

//     // change the password
//     user.password = req.body.password;
//     user.forgotPasswordToken = undefined;
//     user.forgotPasswordExpiry = undefined;

//     await user.save();

//     // send a json response or send token
//     cookieToken(user, res);

// });

// exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
//     // get the user
//     const user = await User.findById(req.user.id);
    
//     res.status(200).json({
//         success: true,
//         user
//     });
// });

// exports.changePassword = BigPromise(async (req, res, next) => {
//     // userid, current password, new password
//     const userId = req.user.id;
//     const { oldPassword, newPassword, confirmNewPassword } = req.body;

//     const user = await User.findById(userId).select('+password');

//     // check oldpassword and password are same
//     const isOldPasswordCorrect = user.isValidatedPassword(oldPassword);

//     if (!isOldPasswordCorrect) {
//         return next(new CustomError("Please enter correct password", 400));
//     }

//     // check if new password and confimnewpassword are same
//     if (newPassword !== confirmNewPassword) {
//         return next(new CustomError("Password and Confirm password do not match", 400));
//     }

//     user.password = newPassword;

//     await user.save();

//     cookieToken(user, res);
// });

// exports.updateUserDetails = BigPromise(async (req, res, next) => {

//     // get the new data
//     const newData = {};

//     // if name is in request
//     if (req.body.name) {
//         newData.name = req.body.name;
//     }

//     // if email is in request
//     if (req.body.email) {
//         newData.email = req.body.email;
//     }

//     // if user wants to change photo
//     if (req.files) {
//         // find the user
//         const user = await User.findById(req.user.id);
//         // get the image id
//         const imageId = user.photo.id;
//         // delete the image from cloudinary
//         const resp = await cloudinary.v2.uploader.destroy(imageId);

//         // upload the new photo to cloudinary
//         let file = req.files.photo;
//         const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
//             folder: "users",
//             width: 150,
//             crop: "scale"
//         });

//         newData.photo = {
//             id: result.public_id,
//             secure_url: result.secure_url
//         };
//     }

//     if (JSON.stringify(newData) === '{}') {
//         return next(new CustomError("Please enter name, email or photo to update.", 400));
//     }
//     const user = await User.findByIdAndUpdate(req.user.id, newData, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false
//     });

//     res.status(200).json({
//         success: true,
//         user
//     });
// });

// exports.adminAllUsers = BigPromise(async (req, res, next) => {
//     const users = await User.find();

//     res.status(200).json({
//         success: true,
//         users
//     }); 
// });

// exports.adminGetSingleUser = BigPromise(async (req, res, next) => {
//     const id = req.params.id;
//     if (!id) {
//         return next(new CustomError("Please Enter a user Id.", 400));
//     }
//     const user = await User.findById(id);

//     if (!user) {
//         return next(new CustomError("User Doesn't Exist.", 400));
//     }

//     res.status(200).json({
//         success: true,
//         user
//     });

// })

// exports.adminUpdateSingleUserDetails = BigPromise(async (req, res, next) => {

//     // get the new data

//     const id = req.params.id;

//     if (!id) {
//         return next(new CustomError("Please enter a user id.", 400));
//     }

//     const newData = {};

//     // if name is in request
//     if (req.body.name) {
//         newData.name = req.body.name;
//     }

//     // if email is in request
//     if (req.body.email) {
//         newData.email = req.body.email;
//     }

//     if (req.body.role) {
//         newData.role = req.body.role;
//     }

//     // if user wants to change photo
//     if (req.files) {
//         // find the user
//         const user = await User.findById(id);
//         // get the image id
//         const imageId = user.photo.id;
//         // delete the image from cloudinary
//         const resp = await cloudinary.v2.uploader.destroy(imageId);

//         // upload the new photo to cloudinary
//         let file = req.files.photo;
//         const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
//             folder: "users",
//             width: 150,
//             crop: "scale"
//         });

//         newData.photo = {
//             id: result.public_id,
//             secure_url: result.secure_url
//         };
//     }

//     if (JSON.stringify(newData) === '{}') {
//         return next(new CustomError("Please enter name, email or photo to update.", 400));
//     }
//     const user = await User.findByIdAndUpdate(id, newData, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false
//     });

//     if (!user) {
//         return next(new CustomError("User Doesn't exist.", 400));
//     }

//     res.status(200).json({
//         success: true,
//         user
//     });
// });

// exports.adminDeleteSingleUser = BigPromise(async (req, res, next) => {
//     const id = req.params.id;

//     if (!id) {
//         return next(new CustomError("Please enter a user id", 400));
//     }

//     const user = await User.findById(id);

//     if (!user) {
//         return next(new CustomError("User doesn't Exist.", 400));
//     }

//     const photoId = user.photo.id;

//     await cloudinary.v2.uploader.destroy(photoId);
    
//      await User.findByIdAndDelete(id);

//     res.status(200).json({
//         success: true,
//         message: "user deleted successfully"
//     });

// })

// exports.managerAllUsers = BigPromise(async (req, res, next) => {
//     const users = await User.find({ role: "user" });

//     res.status(200).json({
//         success: true,
//         users,
//     });
// });