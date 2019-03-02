var express = require('express');
var bodyparser = require('body-parser');
var bodyparser = require('mysql');
var passport = require('passport');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.status(404)
  res.send();
});

/* login related functions. */
router.post('/login', function(req, res, next) {

  var input = {
    type: 'login',
    clientid: 1234,

    userid: 'userid',
    password: 'hashed?',

    isAuth: true,
    isAuthOn: false,
    isWeb: true
  }

  res.status(200)
  // pid, 자동 로그인 토큰 전송
  res.send('respond with a resource');
});

router.post('/register', function(req, res, next) {
  var input = {
    type: 'register',
    clientid: 1234,

    userid: 'userid',
    password: 'hashed?',
    nickname: ''
  }

  res.status(200)
  // 정상 작동 여부 전송
  res.send('respond with a resource');
});

router.post('/logout', function(req, res, next) {
  var input = {
    type: 'logout',
    clientid: 1234,

    sessid: '16진수'
    // 세션 ID 저장용 테이블 생성 필요
  }

  // 자동 로그인 토큰 삭제 필요
  res.status(200)
  // 1
  res.send('respond with a resource');
});

/* info modifier. */
router.post('/get/:data', function(req, res, next) {
  var input = {
    type: 'get',
    data: 'usname/pfimg',
    clientid: 1234,

    sessid: '16진수'
  }

  // username, profile img
  res.status(500)
  // 받아온 데이터
  res.send('respond with a resource');
});

/* create data. currently useless */
/*router.post('/create/:data/', function(req, res, next) {
  var input = {
    type: 'create',
    data: 'aulokey',
    clientid: 1234,

    sessid: '16진수'
  }
  // auth key는 sessid로 통합
  // auth key, auto-login key
  res.status(200)
  // 정상 작동 여부 전송
  res.send('respond with a resource');
});*/

router.post('/verify/:data', function(req, res, next) {
  var input = {
    type: 'verify',
    data: 'password/aulokey/sessid',
    clientid: 1234,

    sessid: '16진수', // sessid 제외
    value: '16진수',
    sysinfo: '', // sessid 한정
  }
  // password, auto-login key, sessid
  res.status(200)
  // 0, 1
  res.send('respond with a resource');
});

router.post('/modify/:data', function(req, res, next) {
  var input = {
    type: 'create',
    data: 'aulokey',
    clientid: 1234,

    sessid: '16진수'
  }
  
  // password, nickname
  res.status(200)
  res.send('respond with a resource');
});
module.exports = router;
