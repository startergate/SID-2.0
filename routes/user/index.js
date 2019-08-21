/*jshint esversion: 9 */

const express = require('express');

const controller = require('./user.controller');

const router = express.Router();

/* GET users listing. */
router.get('/', controller.index);

router.get('/info', controller.info);

router.get('/login', controller.login);

module.exports = router;