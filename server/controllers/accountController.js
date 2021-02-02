const createError = require('http-errors');

//Update user profile.
exports.profile = (req, res, next) => {
    const user = req.user;
    user.name = req.body.name;
    user.about = req.body.about;
    user.avatar = req.file ? req.file.filename : user.avatar;
    user.save()
        .then(updated => {
            // Broadcast the profile changes to users.
            sendUpdateUser(updated);
            res.json();
        })
        .catch(next);
};

// Broadcast the profile changes to users.
const sendUpdateUser = (user) => {
    io.emit('update_user', user.getData());
};

// Change user password
exports.password = (req, res, next) => {
    const { password, newPassword } = req.body;
    let user = req.user;
    if (!user.checkPassword(password)) {
        return next(createError(401, "كلمة المرور خاطئة"));
    }
    // Update password.
    user.password = newPassword;
    user.save().then(updated => res.json())
        .catch(next);
};

