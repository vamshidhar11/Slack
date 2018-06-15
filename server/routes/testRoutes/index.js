const express = require('express');
const router = express.Router();
const db = require('../../models')

router.get('/login', (req, res) => {
    return res.render('auth/login')
})

router.get('/index', (req, res) => {
    return res.render('index')
})

module.exports = router;
