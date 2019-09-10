/* jshint esversion: 9 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.redirect('/docs/latest');
});

router.get('/v2.0', (req, res, next) => {
  res.render('something');
});

router.get('/v2.1', (req, res, next) => {
  res.render('docs.v2.1');
});

module.exports = router;
