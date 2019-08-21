/*jshint esversion: 9 */
// legacy support

const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const passport = require('passport');
const md5 = require('md5');
const sha256 = require('js-sha256').sha256;
//const async = require('async');
const router = express.Router();

const v1Router = require('./v1');
const v1Controller = require('./v1/v1.controller');

var db_conn = mysql.createConnection({
  //host: 'db.donote.co',
  host: '54.180.27.126',
  user: 'root',
  password: 'Wb4H9nn542',
  database: 'sid_userdata'
});

db_conn.connect();

router.use('/v1', v1Router);

router.all('*', v1Controller.rootRequest);

module.exports = router;
