
const express = require('express');

const router = express.Router();

const controller = require('../controllers/authController');

//Login request
router.post('/', controller.login);

//Register request
router.post('/register', controller.register);

module.exports = router;