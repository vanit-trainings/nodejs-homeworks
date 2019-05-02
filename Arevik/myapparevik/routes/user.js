const express = require('express');

const router = express.Router();

const UserController = require('../controllers/user');
const checkAuth = require('../middleware/check-auth');

router.post('/signup', UserController.userSignup);

router.post('/login', UserController.userLogin);

router.delete('/:userId', checkAuth, UserController.userDelete);

module.exports = router;
