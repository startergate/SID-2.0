var express = require('express');
var bodyparser = require('body-parser');
var mysql = require('mysql');
var passport = require('passport');
var router = express.Router();

var db_conn = mysql.createConnection({
  host: 'db.donote.com',
  user: 'root',
  password: 'Wb4H9nn542',
  database: 'sid_userdata'
})

router.all('/', (req, res, next) => {
  res.status(200)
  var output = {
    type: 'response',

    is_vaild: false,
    description: 'Request to ROOT directory of api is prohibited'
  }
  res.send(output);
});

/* login related functions. */
router.post('/login', (req, res, next) => {
  /*var input = {
    type: 'login',
    clientid: '숫자',

    userid: 'userid',
    password: 'hashed',

    isAuth: true,
    isAuthOn: false,
    isWeb: true
  }*/

  console.log(req.body)

  var id = " " // receive POST json ID
  var pw = " " // receive POST json hashed PW

  // 검증

  // 세션 ID 생성

  var sessid = randomString(64)
  // DB
  var rid = 1 // mysql autoincrease

  // 응답용 JSON 작성
  var output = {
    type: 'response',
    rid: '16진수',

    is_vaild: true,
    requested_data: 'sessid',
    response_data: sessid
  }
  //output = JSON.stringify(output);
  //res.status(200, { "Content-Type": "application/json;charset=utf-8" })
  res.status(200)
  // pid, 자동 로그인 토큰 전송
  res.send(output);
});

router.post('/register', (req, res, next) => {
  var input = {
    type: 'register',
    clientid: 1234,

    userid: 'userid',
    password: 'hashed?',
    nickname: ''
  }

  res.status(200)
  // 정상 작동 여부 전송
  var output = {
    type: 'response',
    rid: '16진수',

    is_vaild: true,
    is_succeed: true
  }
  res.send('respond with a resource');
});

router.post('/logout', function(req, res, next) {
  var input = {
    type: 'logout',
    clientid: 1234,

    sessid: '16진수'
  }
  // 세션 ID 저장용 테이블 생성 필요
  var output = {
    type: 'response',
    rid: '16진수',

    is_vaild: true,
    is_succeed: true
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
  res.status(200)
  // 받아온 데이터
  var output = {
    type: 'response',
    rid: '16진수',

    is_vaild: true,
    requested_data: 'usname/pfimg',
    response_data: 'string'
  }
  res.send('respond with a resource');
});

/* create data. currently useless */
router.post('/create/:data/', function(req, res, next) {
  /*var input = {
    type: 'create',
    data: 'clientid/auloid',
    clientid: 1234,

    sessid: '16진수' // clientid의 경우 없음
    client_data: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36 OPR/58.0.3135.79'

  }*/
  createProcessor: {
    if (req.body.data === 'clientid') {
      db_conn.
    } else if (req.body.data === 'aulokey') {

    } else {
      break createProcessor;
    }

  }
  // auto-login key
  res.status(404)
  // 정상 작동 여부 전송
  res.send({
    message: 'use vaild data type'
  });
});

router.post('/verify/:data', function(req, res, next) {
  var input = {
    type: 'verify',
    data: 'password/aulokey/sessid',
    clientid: 1234,

    sessid: '16진수', // sessid 제외
    value: '16진수',
    sysinfo: '' // sessid 한정
  }
  // password, auto-login key, sessid
  res.status(200)
  // 0, 1
  var output = {
    type: 'response',
    rid: '16진수',

    is_vaild: true
  }
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
  var output = {
    type: 'response',
    rid: '16진수',

    is_vaild: true,
    is_processed: true,

    original_data: '1234'
  }
  res.send('respond with a resource');
});

var checkExist = function(targetDB, targetName, targetValue, valueType = 'string') {
  try {
    connection.connect()
    if (valueType === 'string') {
      var sql = "SELECT * FROM "+ targetDB + " WHERE " + targetName + " = '" + targetValue + "'";
    } else {
      var sql = "SELECT * FROM "+ targetDB + " WHERE " + targetName + " = " + targetValue;
    }
  } catch (e) {
    return -1
  }
}

var randomString = function(length) {
  var character = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var rendom_str = '';
  var loopNum = length;
  while (loopNum-=1) {
      rendom_str += character[Math.floor(Math.random() * character.length)];
  }

  return rendom_str;
}

var logCreater = function(type, time, datatype) {
  if (type == 'error') {
    // error_recorder
  } else {
    // response_log
  }
}
module.exports = router;
