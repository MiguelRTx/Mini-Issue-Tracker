const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');

const { requireLogin } = require('../middleware/auth.middleware');

router.post('/login', auth.loginPost);
router.post('/register', auth.registerPost);
router.post('/logout', auth.logoutPost);
router.get('/users', requireLogin, auth.getUsers);

module.exports = router;