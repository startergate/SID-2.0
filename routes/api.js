/*jshint esversion: 9 */

const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const passport = require('passport');
const sha256 = require('js-sha256').sha256;
//const async = require('async');
const router = express.Router();

var db_conn = mysql.createConnection({
  host: 'db.donote.co',
  user: 'root',
  password: 'Wb4H9nn542',
  database: 'sid_userdata'
});

db_conn.connect();

router.all('/', (req, res, next) => {
  var output = {
    type: 'response',

    is_vaild: false,
    description: 'Request to ROOT directory of api is prohibited'
  };
  res.send(output);
});

/* login related functions. */
router.post('/login', async (req, res, next) => {

  // POST DATA 무결성 검증
  if (!(req.body.type === 'login' && jsonChecker(req.body, ['clientid', 'userid', 'password'], [true, true, true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_vaild: false,
      error: 'Missing Arguments. Require Client ID, User ID, Password'
    });
    return;
  }

  // TODO: SQL 인젝션 대비 필요
  var id = db_conn.escape(req.body.userid); // receive POST json ID
  var pw = req.body.password; // receive POST json PW
  var clientid = db_conn.escape(req.body.clientid); // receive POST json CID

  await db_conn.query('SELECT client_data FROM client_list WHERE (clientid LIKE \'' + req.body.clientid + '\')', async (error, results, fields) => {
    if (error) throw error;
    if (results.length < 1) {
      await res.status(400);
      await res.send({
        type: 'error',

        is_vaild: false,
        error: 'Error with Client ID'
      });
      return;
    }

    pw = sha256(pw);
    db_conn.query('SELECT pid FROM userdata WHERE (id LIKE \'' + id + '\') AND (pw LIKE \'' + pw + '\')', async (error, results, fields) => {
      if (error) throw error;
      if (results.length < 1) {
        await res.status(400);
        await res.send({
          type: 'error',

          is_vaild: false,
          error: 'Error with User Information'
        });
        return;
      }
      var expireData = new Date();
      expireData.setUTCMonth((expireData.getUTCMonth() + 3) % 11);
      if ((expireData.getUTCMonth() + 3) / 11 > 1) {
        expireData.setUTCFullYear(expireData.getUTCFullYear() + 1);
      }
      expireData = expireData.toISOString().slice(0, 19).replace('T', ' ');
      sessid = randomString(64);

      db_conn.query(`INSERT INTO session_list (sessid, pid, clientid, expire) VALUES ('${sessid}', '${results[0].pid}', '${clientid}', '${expireData}')`, (error, results, fields) => {
        if (error) throw error;
      });

      await res.status(200);
      await res.send({
        type: 'response',


        is_vaild: true,
        requested_data: [
          'sessid',
          'pid',
          'expire'
        ],
        response_data: [
          sessid,
          results[0].pid,
          expireData
        ]
      });
    });
  });
});

router.post('/register', async (req, res, next) => {
  var input = {
    type: 'register',
    clientid: 1234,

    userid: 'userid',
    password: 'non-hashed',
    nickname: ''
  };

  // POST DATA 무결성 검증
  if (!(req.body.type === 'register' && jsonChecker(req.body, ['clientid', 'userid', 'password'], [true, true, true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_vaild: false,
      error: 'Missing Arguments. Require Client ID, User ID, Password'
    });
    return;
  }

  var id = db_conn.escape(req.body.userid); // receive POST json ID
  var pw = req.body.password; // receive POST json PW
  var clientid = db_conn.escape(req.body.clientid); // receive POST json CID
  var nickname = db_conn.escape(req.body.nickname); // receive POST json CID
  if (nickname == '') {
    nickname = id;
  }

  await db_conn.query('SELECT client_data FROM client_list WHERE (clientid LIKE \'' + req.body.clientid + '\')', async (error, results, fields) => {
    if (error) throw error;
    if (results.length < 1) {
      await res.status(400);
      await res.send({
        type: 'error',

        is_vaild: false,
        error: 'Error with Client ID'
      });
      return;
    }
    pw = sha256(pw);
    sessid = randomString(32);
    db_conn.query(`INSERT INTO userdata (id,pw,nickname,register_date,pid) VALUES('${id}', '${pw}', '${nickname}', now(), '${sessid}')`, async (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500);
        // 정상 작동 여부 전송
        res.send({
          type: 'response',

          is_vaild: true,
          is_succeed: false
        });
        return;
      }

      res.status(200);
      // 정상 작동 여부 전송
      res.send({
        type: 'response',

        is_vaild: true,
        is_succeed: true
      });
    });
  });
});

router.post('/logout', function(req, res, next) {
  var input = {
    type: 'logout',
    clientid: 1234,

    sessid: '16진수'
  };
  // 세션 ID 저장용 테이블 생성 필요
  var output = {
    type: 'response',


    is_vaild: true,
    is_succeed: true
  };
  // 자동 로그인 토큰 삭제 필요
  res.status(200);
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
  };

  // username, profile img
  res.status(200);
  // 받아온 데이터
  var output = {
    type: 'response',


    is_vaild: true,
    requested_data: 'usname/pfimg',
    response_data: 'string'
  };
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
      //db_conn.
    } else if (req.body.data === 'aulokey') {

    } else {
      break createProcessor;
    }

  }
  // auto-login key
  res.status(404);
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
    value: '16진수'
  };
  // password, auto-login key, sessid
  res.status(200);
  // 0, 1
  var output = {
    type: 'response',


    is_vaild: true
  };
  res.send('respond with a resource');
});

router.post('/modify/:data', function(req, res, next) {
  var input = {
    type: 'create',
    data: 'aulokey',
    clientid: 1234,

    sessid: '16진수'
  };

  // password, nickname
  res.status(200);
  var output = {
    type: 'response',


    is_vaild: true,
    is_processed: true,

    original_data: '1234'
  };
  res.send('respond with a resource');
});

var checkExist = function(targetDB, targetName, targetValue, valueType = 'string') {
  try {
    connection.connect();
    var sql;
    if (valueType === 'string') {
      sql = "SELECT * FROM " + targetDB + " WHERE " + targetName + " = '" + targetValue + "'";
    } else {
      sql = "SELECT * FROM " + targetDB + " WHERE " + targetName + " = " + targetValue;
    }
  } catch (e) {
    return -1;
  }
};

var randomString = function(length) {
  var character = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var rendom_str = '';
  var loopNum = length;
  while (loopNum) {
    rendom_str += character[Math.floor(Math.random() * character.length)];
    loopNum -= 1;
  }

  return rendom_str;
};

var logCreater = (type, time, datatype) => {
  if (type == 'error') {
    // error_recorder
  } else {
    // response_log
  }
};

var jsonChecker = (_json, variablesArray, isMustFilled) => {
  if (!Array.isArray(variablesArray) || !Array.isArray(isMustFilled)) {
    throw new TypeError('Input Data is not an array');
  }
  if (typeof _json !== 'object') {
    throw new TypeError('Input Data is not an object');
  }
  var cnt = 0;
  for (var data in _json) {
    if (variablesArray.indexOf(data) === -1) continue;
    if (!(_json[data] || !isMustFilled[cnt])) return 0;

    cnt++;
  }
  if (cnt !== variablesArray.length) return 0;
  for (var variable in variablesArray) {
    if (!_json.hasOwnProperty(variablesArray[variable])) return 0;
  }
  return 1;
};
module.exports = router;