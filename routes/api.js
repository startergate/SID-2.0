var express = require('express');
var bodyparser = require('body-parser');
var passport = require('passport');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.status(404)
  res.send();
});

/* login related functions. */
router.post('/login', function(req, res, next) {
  res.status(500)
  res.send('respond with a resource');
});

router.post('/register', function(req, res, next) {
  res.status(500)
  res.send('respond with a resource');
});

router.post('/logout', function(req, res, next) {
  // 자동 로그인 삭제 필요
  res.status(500)
  res.send('respond with a resource');
});

/* info modifier. */
router.post('/get/:data', function(req, res, next) {
  // username, profile img
  res.status(500)
  res.send('respond with a resource');
});

/* create data. */
router.post('/create/:data/', function(req, res, next) {
  // auth key, auto-login key
  res.status(200)
  res.send('respond with a resource');
});

router.post('/verify/:data', function(req, res, next) {
  // password, auth key, auto-login key
  res.status(200)
  res.send('respond with a resource');
});

router.post('/modify/:data', function(req, res, next) {
  // password, nickname
  res.status(200)
  res.send('respond with a resource');
});
module.exports = router;
