/*jshint esversion: 9 */

const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const passport = require('passport');
const md5 = require('md5');
const sha256 = require('js-sha256').sha256;
//const async = require('async');
const router = express.Router();

var db_conn = mysql.createConnection({
  //host: 'db.donote.co',
  host: '54.180.27.126',
  user: 'root',
  password: 'Wb4H9nn542',
  database: 'sid_userdata'
});

db_conn.connect();

router.all('/', (req, res, next) => {
  var output = {
    type: 'error',

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
    if (error) {
      console.log(error);
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_vaild: true,
        is_succeed: false
      });
      return;
    }
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
    db_conn.query('SELECT nickname, pid FROM userdata WHERE (id LIKE ' + id + ') AND (pw LIKE \'' + pw + '\')', async (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500);
        // 정상 작동 여부 전송
        res.send({
          type: 'error',

          is_vaild: true,
          is_succeed: false
        });
        return;
      }
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

      db_conn.query('INSERT INTO session_list (sessid, pid, clientid, expire) VALUES (\'' + sessid + '\', \'' + results[0].pid + '\', ' + clientid + ', \'' + expireData + '\')', (error, results, fields) => {
        if (error) console.log(error);
      });

      db_conn.query('UPDATE client_list SET recent_login=now(), recent_id=' + id + ' WHERE clientid=' + clientid, (error, results, fields) => {
        if (error) console.log(error);
      });

      await res.status(200);
      await res.send({
        type: 'response',

        is_vaild: true,
        requested_data: [
          'sessid',
          'pid',
          'nickname',
          'expire'
        ],
        response_data: [
          sessid,
          results[0].pid,
          results[0].nickname,
          expireData
        ]
      });
    });
  });
});

router.post('/register', async (req, res, next) => {
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
    if (error) {
      console.log(error);
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_vaild: true,
        is_succeed: false
      });
      return;
    }
    if (results.length < 1) {
      await res.status(400);
      await res.send({
        type: 'error',

        is_vaild: false,
        error: 'Error with Client ID'
      });
      return;
    }
    var pid = md5(id + pw + id);
    pw = sha256(pw);
    db_conn.query('INSERT INTO userdata (id,pw,nickname,register_date,pid) VALUES(' + id + ', \'' + pw + '\', ' + nickname + ', now(), \'' + pid + '\')', async (error, results, fields) => {
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
        is_succeed: true,
        private_id: pid
      });
    });
  });
});

router.post('/logout', function(req, res, next) {
  // POST DATA 무결성 검증
  if (!(req.body.type === 'logout' && jsonChecker(req.body, ['clientid', 'sessid'], [true, true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_vaild: false,
      error: 'Missing Arguments. Require Client ID, Session ID'
    });
    return;
  }

  sessid = db_conn.escape(req.body.sessid);
  clientid = db_conn.escape(req.body.clientid);
  db_conn.query('SELECT pid FROM session_list WHERE (sessid LIKE ' + sessid + ') AND (clientid LIKE ' + clientid + ')', (error, results, fields) => {
    if (error) {
      console.log(error);
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_vaild: true,
        is_succeed: false
      });
      return;
    }
    if (results.length < 1) {
      res.status(400);
      res.send({
        type: 'error',

        is_vaild: false,
        error: 'Error with Session ID or Client ID'
      });
      return;
    }
    db_conn.query('DELETE FROM session_list WHERE sessid=' + sessid, (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500);
        // 정상 작동 여부 전송
        res.send({
          type: 'error',

          is_vaild: true,
          is_succeed: false
        });
        return;
      }
      res.status(200);
      res.send({
        type: 'response',


        is_vaild: true,
        is_succeed: true
      });
    });
  });
});

/* info modifier. */
router.post('/get/:data', function(req, res, next) {
  // POST DATA 무결성 검증
  if (!(req.body.type === 'get' && jsonChecker(req.body, ['data', 'clientid', 'sessid'], [true, true, true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_vaild: false,
      error: 'Missing Arguments. Require Requested Data Type, Client ID, Session ID'
    });
    return;
  }
  sessid = db_conn.escape(req.body.sessid);
  clientid = db_conn.escape(req.body.clientid);
  db_conn.query('SELECT pid FROM session_list WHERE (sessid LIKE ' + sessid + ') AND (clientid LIKE ' + clientid + ')', (error, results, fields) => {
    if (error) {
      console.log(error);
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_vaild: true,
        is_succeed: false
      });
      return;
    }
    if (results.length < 1) {
      res.status(400);
      res.send({
        type: 'error',

        is_vaild: false,
        error: 'Error with Session ID or Client ID'
      });
      return;
    }
    switch (req.body.data) {
      case 'usname':
        db_conn.query('SELECT id FROM userdata WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
          if (error) {
            console.log(error);
            res.status(500);
            // 정상 작동 여부 전송
            res.send({
              type: 'error',

              is_vaild: true,
              is_succeed: false
            });
            return;
          }
          res.status(200);
          res.send({
            type: 'response',


            is_vaild: true,
            requested_data: 'usname',
            response_data: results[0].id
          });
        });
        break;
      case 'pfimg':
        db_conn.query('SELECT profile_img FROM userdata WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
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
          res.send({
            type: 'response',


            is_vaild: true,
            requested_data: 'pfimg',
            response_data: results[0].profile_img
          });
        });
        break;
      default:
        res.status(400);
        res.send({
          type: 'error',

          is_vaild: false,
          error: 'Invaild Requested Data Type'
        });
        return;
    }
  });

  // username, profile img
});

/* create data. currently useless */
router.post('/create/:data/', function(req, res, next) {
  // POST DATA 무결성 검증
  if (!(req.body.type === 'create' && jsonChecker(req.body, ['data'], [true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_vaild: false,
      error: 'Missing Arguments. Require Requested Data Type'
    });
    return;
  }
  switch (req.body.data) {
    case 'clientid':
      if (!jsonChecker(req.body, ['devicedata'], [true])) {
        res.status(400);
        res.send({
          type: 'error',

          is_vaild: false,
          error: 'Missing Arguments. Require Requested Data Type'
        });
        return;
      }
      devicedata = db_conn.escape(req.body.devicedata);
      clientid = randomString(64);
      db_conn.query('INSERT INTO client_list (clientid, client_data) VALUES(\'' + clientid + '\', ' + devicedata + ')', async (error, results, fields) => {
        if (error) {
          console.log(error);
          res.status(500);
          // 정상 작동 여부 전송
          res.send({
            type: 'error',

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
          is_succeed: true,

          requested_data: clientid
        });
      });
      break;
    default:
      res.status(400);
      res.send({
        type: 'error',

        is_vaild: false,
        error: 'Invaild Requested Data Type'
      });
      return;
  }
});

router.post('/verify/:data', function(req, res, next) {
  var input = {
    type: 'verify',
    data: 'password/sessid',
    clientid: 1234,

    sessid: '16진수', // sessid 제외
    value: '16진수'
  };
  // POST DATA 무결성 검증
  if (!(req.body.type === 'verify' && jsonChecker(req.body, ['data', 'clientid', 'sessid'], [true, true, true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_vaild: false,
      error: 'Missing Arguments. Require Requested Data Type, Client ID, Session ID, Value'
    });
    return;
  }

  sessid = db_conn.escape(req.body.sessid);
  clientid = db_conn.escape(req.body.clientid);
  db_conn.query('SELECT pid FROM session_list WHERE (sessid LIKE ' + sessid + ') AND (clientid LIKE ' + clientid + ')', (error, results, fields) => {
    if (error) {
      console.log(error);
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_vaild: true,
        is_succeed: false
      });
      return;
    }
    if (req.body.data === 'sessid') {
      if (results.length < 1) {
        res.status(200);
        res.send({
          type: 'response',

          is_vaild: false
        });
      } else {
        res.status(200);
        res.send({
          type: 'response',

          is_vaild: true
        });
      }
      return;
    }
    if (results.length < 1) {
      res.status(400);
      res.send({
        type: 'error',

        is_vaild: false,
        error: 'Invaild Session ID or Client ID'
      });
      return;
    }
    switch (req.body.data) {
      case 'password':
        if (!jsonChecker(req.body, ['data', 'clientid', 'sessid', 'value'], [true, true, true, true])) {
          res.status(400);
          res.send({
            type: 'error',

            is_vaild: false,
            error: 'Missing Arguments. Require Requested Data Type, Client ID, Session ID, Value'
          });
          return;
        }
        db_conn.query('SELECT pw FROM userdata WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
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
          if (results[0].pw === sha256(req.body.value)) {
            res.status(200);
            res.send({
              type: 'response',

              is_vaild: true
            });
          } else {
            res.status(200);
            res.send({
              type: 'response',

              is_vaild: false
            });
          }
        });
        break;

      default:
        res.status(400);
        res.send({
          type: 'error',

          is_vaild: false,
          error: 'Invaild Requested Data Type'
        });
        return;
    }
  });
  // password, sessid
});

router.post('/modify/:data', function(req, res, next) {
  var input = {
    type: 'modify',
    data: 'password/nickname',
    clientid: 1234,

    sessid: '16진수',
    value: '1234'
  };

  // POST DATA 무결성 검증
  if (!(req.body.type === 'modify' && jsonChecker(req.body, ['data', 'clientid', 'sessid', 'value'], [true, true, true, true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_vaild: false,
      error: 'Missing Arguments. Require Requested Data Type, Client ID, Session ID, Value'
    });
    return;
  }

  sessid = db_conn.escape(req.body.sessid);
  clientid = db_conn.escape(req.body.clientid);
  db_conn.query('SELECT pid FROM session_list WHERE (sessid LIKE ' + sessid + ') AND (clientid LIKE ' + clientid + ')', (error, results, fields) => {
    if (error) {
      console.log(error);
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_vaild: true,
        is_succeed: false
      });
      return;
    }

    if (results.length < 1) {
      res.status(400);
      res.send({
        type: 'error',

        is_vaild: false,
        error: 'Invaild Session ID or Client ID'
      });
      return;
    }
    value = req.body.value;
    switch (req.body.data) {
      case 'password':
        value = sha256(req.body.value);
        db_conn.query('UPDATE userdata SET pw=\'' + value + '\' WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
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
          res.send({
            type: 'response',

            is_vaild: true,
            is_processed: true
          });
        });
        break;
      case 'nickname':
        db_conn.query('UPDATE userdata SET nickname=\'' + value + '\' WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
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
          res.send({
            type: 'response',

            is_vaild: true,
            is_processed: true
          });
        });
        break;
        // TODO: Add nickname change
      default:
        res.status(400);
        res.send({
          type: 'error',

          is_vaild: false,
          error: 'Invaild Requested Data Type'
        });
        return;
    }
  });
  // password, nickname
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