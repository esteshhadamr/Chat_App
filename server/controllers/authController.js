const User = require('../models/user');
const createError = require('http-errors');

/** Login */
exports.login = (req, res, next) => {
    const { username, password } = req.body;
    // Find user by username.
    User.findOne({ username }).then(user => {
        // if user not found or password is wrong then create error 404.
        if (!user || !user.checkPassword(password)) {
            throw createError(401, 'الرجاء التحقق من اسم المستخدم وكلمة المرور');
        }
        // Generate user token.
        res.json(user.signJwt());
    })
        .catch(next);
};

/** Register */
exports.register = (req, res, next) => {
    let data = { name, username, password } = req.body;
    User.findOne({ username })
        .then(user => {
            // if username already exist then create error.
            if (user) throw createError(422, "اسم المستخدم موجود مسبقاً");
            return User.create(data);
        })
        .then(user => {
            // Generate user token.
            res.json(user.signJwt());
            sendNewUser(user);
        })
        .catch(next);
};

// Broadcast created user profile to users
const sendNewUser = user => {
    let data = { name, username, avatar } = user;
    io.emit('new_user', data);
};