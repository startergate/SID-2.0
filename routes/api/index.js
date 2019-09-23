/* jshint esversion: 9 */

const express = require('express');
const router = express.Router();

const v1Router = require('./v1');
const v1Controller = require('./v1/v1.controller');

router.use('/v1', v1Router);

router.all('*', v1Controller.rootRequest);

module.exports = router;
