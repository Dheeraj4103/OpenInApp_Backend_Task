const User = require('../models/User');
const BigPromise = require("./bigPromise");
const CustomError = require("../utils/customError");
const jwt = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    // get the token
    const token = req.cookies.token || req.header("Authorization").replace("Bearer ", "") || req.body.token;

    // check if user is logged in
    if (!token) {
        return next(new CustomError("Login first to access this page.", 401));
    }

    // decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // get the user
    req.user = await User.findById(decoded.id);

    next();
});

// exports.customRole = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return next(new CustomError("You are not allowed to access this url.", 403));
//         }

//         next();
//     };
// };