/**
 * @file
 * Handles user logout
 */

const express = require('express');
const sessionChecker = require('../utils/session-checker');
const router = express.Router();

// Route for user logout
router.get('/', sessionChecker.filterLoggedOut, (req, res) => {
    res.clearCookie('user_sid');
    res.redirect('/');
});

module.exports = router;
