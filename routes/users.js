/*jshint esversion: 9 */

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.redirect('/users/info');
});

router.get('/info', (req, res, next) => {
  res.render('something');
});

router.get('/edit', (req, res, next) => {
  res.end('dev');
});

module.exports = router;