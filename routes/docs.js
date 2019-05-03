/*jshint esversion: 9 */

var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.redirect('/docs/v2.1');
});

router.get('/v2.0', (req, res, next) => {
  res.render('something');
});

router.get('/v2.1', (req, res, next) => {
  res.end('dev');
});

module.exports = router;