const express = require('express');

const router = express.Router();

const UserController = require('../controllers/base_model');
const checkAuth = require('../middleware/check-auth');
router.get('/book', UserController.getAllBooks);
router.post('/onebook', UserController.getOneBook);

router.post('/login', UserController.userLogin);

router.delete('/:userId', checkAuth, UserController.userDelete);

module.exports = router;
