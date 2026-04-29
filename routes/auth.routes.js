const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');

router.get('/login', auth.loginGet);
router.post('/login', auth.loginPost);
router.get('/register', auth.registerGet);
router.post('/register', auth.registerPost);
router.post('/logout', auth.logoutPost);

module.exports = router;
