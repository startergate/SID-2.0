/*jshint esversion: 9 */

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.redirect('/user/info');
});

router.get('/info', (req, res, next) => {
  res.render('user/info.ejs');
});

module.exports = router;