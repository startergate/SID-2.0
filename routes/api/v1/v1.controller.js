const mysql = require('mysql');
// const passport = require('passport');
const md5 = require('md5');
const sha256 = require('js-sha256').sha256;

const sidUniversal = require('../../../modules/sidUniversal');

const db_conn = mysql.createConnection({ // eslint-disable-line
  // host: 'db.donote.co',
  host: '54.180.27.126',
  user: 'root',
  password: 'Wb4H9nn542',
  database: 'sid_userdata'
});

db_conn.connect();

exports.rootRequest = (req, res, next) => {
  res.status(400);
  res.send({
    type: 'error',

    is_valid: false,
    is_vaild: false,
    description: 'Prohibited Route'
  });
};

exports.createSession = async (req, res, next) => {
  if ('sessid' in req.body) {
    if (!(req.body.type === 'login' && sidUniversal.jsonChecker(req.body, ['clientid', 'sessid'], [true, true]))) { // POST DATA 무결성 검증
      res.status(400);
      res.send({
        type: 'error',

        is_valid: false,
        is_vaild: false,
        error: 'Missing Arguments. Require Client ID, Session ID'
      });
      return;
    }
    const clientid = db_conn.escape(req.body.clientid); // receive POST json CID
    const sessid = db_conn.escape(req.body.sessid);
    db_conn.query('SELECT pid FROM session_list WHERE (sessid LIKE ' + sessid + ') AND (clientid LIKE ' + clientid + ')', (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500);
        // 정상 작동 여부 전송
        res.send({
          type: 'error',

          is_valid: true,
          is_vaild: true,
          is_succeed: false
        });
        return;
      }
      if (results.length < 1) {
        if (res.body.isClient) {
          res.status(200);
        } else {
          res.status(400);
        }
        res.send({
          type: 'error',

          is_valid: false,
          is_vaild: false,
          error: 'Error with Session ID or Client ID'
        });
        return;
      }
      db_conn.query('SELECT nickname, pid FROM userdata WHERE pid LIKE \'' + results[0].pid + '\'', async (error, result, fields) => {
        if (error) {
          console.error(error);
          res.status(500);
          // 정상 작동 여부 전송
          res.send({
            type: 'error',

            is_valid: true,
            is_vaild: true,
            is_succeed: false
          });
          return;
        }
        if (results.length < 1) {
          await res.status(400);
          await res.send({
            type: 'error',

            is_valid: false,
            is_vaild: false,
            error: 'Error with User Information'
          });
          return;
        }
        let expireData = new Date();
        expireData.setUTCMonth((expireData.getUTCMonth() + 3) % 11);
        if ((expireData.getUTCMonth() + 3) / 11 > 1) {
          expireData.setUTCFullYear(expireData.getUTCFullYear() + 1);
        }
        expireData = expireData.toISOString().slice(0, 19).replace('T', ' ');

        db_conn.query('UPDATE session_list SET expire="' + expireData + '" WHERE sessid=' + sessid, (error, results, fields) => {
          if (error) console.error(error);
        });

        res.status(200);
        res.send({
          "type": 'response',

          is_valid: true,
          is_vaild: true,
          requested_data: [
            'sessid',
            'pid',
            'nickname',
            'expire'
          ],
          response_data: [
            sessid.split("'").join(''),
            results[0].pid, // 바깥 쪽에서 가져옴
            result[0].nickname,
            expireData
          ]
        });
      });
    });
  } else if (!(req.body.type === 'login' && sidUniversal.jsonChecker(req.body, ['clientid', 'userid', 'password'], [true, true, true]))) { // POST DATA 무결성 검증
    res.status(400);
    res.send({
      type: 'error',

      is_valid: false,
      is_vaild: false,
      error: 'Missing Arguments. Require Client ID, User ID, Password'
    });
  } else {
    const id = db_conn.escape(req.body.userid); // receive POST json ID
    let pw = req.body.password; // receive POST json PW
    const clientid = db_conn.escape(req.body.clientid); // receive POST json CID
    await db_conn.query('SELECT client_data FROM client_list WHERE (clientid LIKE ' + clientid + ')', async (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500);
        // 정상 작동 여부 전송
        res.send({
          type: 'error',

          is_valid: true,
          is_vaild: true,
          is_succeed: false
        });
        return;
      }
      if (results.length < 1) {
        await res.status(400);
        await res.send({
          type: 'error',

          is_valid: false,
          is_vaild: false,
          error: 'Error with Client ID'
        });
        return;
      }

      pw = sha256(pw);
      db_conn.query('SELECT nickname, pid FROM userdata WHERE (id LIKE ' + id + ') AND (pw LIKE \'' + pw + '\')', async (error, results, fields) => {
        if (error) {
          console.error(error);
          res.status(500);
          // 정상 작동 여부 전송
          res.send({
            type: 'error',

            is_valid: true,
            is_vaild: true,
            is_succeed: false
          });
          return;
        }
        if (results.length < 1) {
          console.log(req.body);
          if (req.body.isClient) {
            res.status(200);
          } else {
            res.status(400);
          }
          await res.send({
            type: 'error',

            is_valid: false,
            is_vaild: false,
            error: 'Error with User Information'
          });
          return;
        }
        let expireData;
        if (req.body.isPermanent) {
          expireData = new Date(0);
        } else {
          expireData = new Date();
          expireData.setUTCMonth((expireData.getUTCMonth() + 3) % 11);
          if ((expireData.getUTCMonth() + 3) / 11 > 1) {
            expireData.setUTCFullYear(expireData.getUTCFullYear() + 1);
          }
        }
        expireData = expireData.toISOString().slice(0, 19).replace('T', ' ');
        const sessid = sidUniversal.randomString(64);

        db_conn.query('INSERT INTO session_list (sessid, pid, clientid, expire) VALUES (\'' + sessid + '\', \'' + results[0].pid + '\', ' + clientid + ', \'' + expireData + '\')', (error, results, fields) => {
          if (error) console.error(error);
        });

        db_conn.query('UPDATE client_list SET recent_login=now(), recent_id=' + id + ' WHERE clientid=' + clientid, (error, results, fields) => {
          if (error) console.error(error);
        });

        await res.status(200);
        await res.send({
          type: 'response',

          is_valid: true,
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
  }
};

exports.createUser = async (req, res, next) => {
  // POST DATA 무결성 검증
  if (!(req.body.type === 'register' && sidUniversal.jsonChecker(req.body, ['clientid', 'userid', 'password'], [true, true, true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_valid: false,
      is_vaild: false,
      error: 'Missing Arguments. Require Client ID, User ID, Password'
    });
    return;
  }

  const id = db_conn.escape(req.body.userid); // receive POST json ID
  let pw = req.body.password; // receive POST json PW
  const clientid = db_conn.escape(req.body.clientid); // receive POST json CID
  let nickname = db_conn.escape(req.body.nickname); // receive POST json CID
  if (nickname === '') {
    nickname = id;
  }

  await db_conn.query('SELECT client_data FROM client_list WHERE (clientid LIKE ' + clientid + ')', async (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_valid: true,
        is_vaild: true,
        is_succeed: false
      });
      return;
    }
    if (results.length < 1) {
      await res.status(400);
      await res.send({
        type: 'error',

        is_valid: false,
        is_vaild: false,
        error: 'Error with Client ID'
      });
      return;
    }
    const pid = md5(id + pw + id);
    pw = sha256(pw);
    db_conn.query('INSERT INTO userdata (id,pw,nickname,register_date,pid) VALUES(' + id + ', \'' + pw + '\', ' + nickname + ', now(), \'' + pid + '\')', async (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500);
        // 정상 작동 여부 전송
        res.send({
          type: 'response',

          is_valid: true,
          is_vaild: true,
          is_succeed: false
        });
        return;
      }

      res.status(200);
      // 정상 작동 여부 전송
      res.send({
        type: 'response',

        is_valid: true,
        is_vaild: true,
        is_succeed: true,
        private_id: pid
      });
    });
  });
};

exports.deleteSession = (req, res, next) => {
  // POST DATA 무결성 검증
  if (!(req.body.type === 'logout' && sidUniversal.jsonChecker(req.body, ['clientid', 'sessid'], [true, true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_valid: false,
      is_vaild: false,
      error: 'Missing Arguments. Require Client ID, Session ID'
    });
    return;
  }

  const sessid = db_conn.escape(req.body.sessid);
  const clientid = db_conn.escape(req.body.clientid);
  db_conn.query('SELECT pid FROM session_list WHERE (sessid LIKE ' + sessid + ') AND (clientid LIKE ' + clientid + ')', (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_valid: true,
        is_vaild: true,
        is_succeed: false
      });
      return;
    }
    if (results.length < 1) {
      res.status(400);
      res.send({
        type: 'error',

        is_valid: false,
        is_vaild: false,
        error: 'Error with Session ID or Client ID'
      });
      return;
    }
    db_conn.query('DELETE FROM session_list WHERE sessid=' + sessid, (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500);
        // 정상 작동 여부 전송
        res.send({
          type: 'error',

          is_valid: true,
          is_vaild: true,
          is_succeed: false
        });
        return;
      }
      res.status(200);
      res.send({
        type: 'response',

        is_valid: true,
        is_vaild: true,
        is_succeed: true
      });
    });
  });
};

exports.getUserInfo = (req, res, next) => {
  const sessid = db_conn.escape(req.params.sessid);
  const clientid = db_conn.escape(req.params.clientid);
  db_conn.query('SELECT pid FROM session_list WHERE (sessid LIKE ' + sessid + ') AND (clientid LIKE ' + clientid + ')', (error, results, fields) => {
    if (error) {
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_valid: true,
        is_vaild: true,
        is_succeed: false
      });
      return;
    }
    if (results.length < 1) {
      res.status(400);
      res.send({
        type: 'error',

        is_valid: false,
        is_vaild: false,
        error: 'Error with Session ID or Client ID'
      });
      return;
    }
    switch (req.params.data) {
      case 'usname':
        db_conn.query('SELECT id FROM userdata WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
          if (error) {
            console.error(error);
            res.status(500);
            // 정상 작동 여부 전송
            res.send({
              type: 'error',

              is_valid: true,
              is_vaild: true,
              is_succeed: false
            });
            return;
          }
          res.status(200);
          res.send({
            type: 'response',

            is_valid: true,
            is_vaild: true,
            requested_data: 'usname',
            response_data: results[0].id
          });
        });
        break;
      case 'pfimg':
        db_conn.query('SELECT profile_img FROM userdata WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
          if (error) {
            console.error(error);
            res.status(500);
            // 정상 작동 여부 전송
            res.send({
              type: 'response',

              is_valid: true,
              is_vaild: true,
              is_succeed: false
            });
            return;
          }
          res.status(200);
          res.send({
            type: 'response',

            is_valid: true,
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

          is_valid: false,
          is_vaild: false,
          error: 'Invaild Requested Data Type'
        });
    }
  });

  // username, profile img
};

exports.createUserInfo = (req, res, next) => {
  // POST DATA 무결성 검증
  if (!(req.body.data === req.params.data && sidUniversal.jsonChecker(req.body, ['data'], [true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_valid: false,
      is_vaild: false,
      error: 'Missing Arguments. Require Requested Data Type'
    });
    return;
  }
  switch (req.params.data) {
    case 'clientid': {
      if (!sidUniversal.jsonChecker(req.body, ['devicedata'], [true])) {
        res.status(400);
        res.send({
          type: 'error',

          is_valid: false,
          is_vaild: false,
          error: 'Missing Arguments. Require Requested Data Type'
        });
        return;
      }
      const devicedata = db_conn.escape(req.body.devicedata);
      const clientid = sidUniversal.randomString(64);
      db_conn.query('INSERT INTO client_list (clientid, client_data) VALUES(\'' + clientid + '\', ' + devicedata + ')', async (error, results, fields) => {
        if (error) {
          console.error(error);
          res.status(500);
          // 정상 작동 여부 전송
          res.send({
            type: 'error',

            is_valid: true,
            is_vaild: true,
            is_succeed: false
          });
          return;
        }

        res.status(200);
        // 정상 작동 여부 전송
        res.send({
          type: 'response',

          is_valid: true,
          is_vaild: true,
          is_succeed: true,

          requested_data: 'clientid',
          response_data: clientid
        });
      });
      break;
    }
    default:
      res.status(400);
      res.send({
        type: 'error',

        is_valid: false,
        is_vaild: false,
        error: 'Invaild Requested Data Type'
      });
  }
};

exports.verifyUserInfo = (req, res, next) => {
  // POST DATA 무결성 검증
  if (!(req.body.data === req.params.data && sidUniversal.jsonChecker(req.body, ['data', 'clientid', 'sessid'], [true, true, true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_valid: false,
      is_vaild: false,
      error: 'Missing Arguments. Require Requested Data Type, Client ID, Session ID'
    });
    return;
  }

  const sessid = db_conn.escape(req.body.sessid);
  const clientid = db_conn.escape(req.body.clientid);
  db_conn.query('SELECT pid FROM session_list WHERE (sessid LIKE ' + sessid + ') AND (clientid LIKE ' + clientid + ')', (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_valid: true,
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

          is_valid: false,
          is_vaild: false
        });
      } else {
        res.status(200);
        res.send({
          type: 'response',

          is_valid: true
          is_vaild: true
        });
      }
      return;
    }
    if (results.length < 1) {
      res.status(400);
      res.send({
        type: 'error',

        is_valid: false,
        is_vaild: false,
        error: 'Invaild Session ID or Client ID'
      });
      return;
    }
    switch (req.body.data) {
      case 'password':
        if (!sidUniversal.jsonChecker(req.body, ['data', 'clientid', 'sessid', 'value'], [true, true, true, true])) {
          res.status(400);
          res.send({
            type: 'error',

            is_valid: false,
            is_vaild: false,
            error: 'Missing Arguments. Require Requested Data Type, Client ID, Session ID, Value'
          });
          return;
        }
        db_conn.query('SELECT pw FROM userdata WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
          if (error) {
            console.error(error);
            res.status(500);
            // 정상 작동 여부 전송
            res.send({
              type: 'response',

              is_valid: true,
              is_vaild: true,
              is_succeed: false
            });
            return;
          }
          if (results[0].pw === sha256(req.body.value)) {
            res.status(200);
            res.send({
              type: 'response',

              is_valid: true,
              is_vaild: true
            });
          } else {
            res.status(200);
            res.send({
              type: 'response',

              is_valid: false,
              is_vaild: false
            });
          }
        });
        break;

      default:
        res.status(400);
        res.send({
          type: 'error',

          is_valid: false,
          is_vaild: false,
          error: 'Invaild Requested Data Type'
        });
    }
  });
  // password, sessid
};

exports.checkExistData = async (req, res, next) => {
  switch (req.params.type) {
    case 'id':
      sidUniversal.checkExist(db_conn, 'userdata', req.params.type, req.params.data, (isExist) => {
        res.send({
          type: 'response',

          is_exist: isExist
        });
      });
  }
};

exports.modifyUserData = (req, res, next) => {
  // POST DATA 무결성 검증
  if (!(req.body.type === 'modify' && sidUniversal.jsonChecker(req.body, ['data', 'clientid', 'sessid', 'value'], [true, true, true, true]))) {
    res.status(400);
    res.send({
      type: 'error',

      is_valid: false,
      is_vaild: false,
      error: 'Missing Arguments. Require Requested Data Type, Client ID, Session ID, Value'
    });
    return;
  }

  const sessid = db_conn.escape(req.body.sessid);
  const clientid = db_conn.escape(req.body.clientid);
  db_conn.query('SELECT pid FROM session_list WHERE (sessid LIKE ' + sessid + ') AND (clientid LIKE ' + clientid + ')', (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500);
      // 정상 작동 여부 전송
      res.send({
        type: 'error',

        is_valid: true,
        is_vaild: true,
        is_succeed: false
      });
      return;
    }

    if (results.length < 1) {
      res.status(400);
      res.send({
        type: 'error',

        is_valid: false,
        is_vaild: false,
        error: 'Invaild Session ID or Client ID'
      });
      return;
    }
    let value = req.body.value;
    switch (req.body.data) {
      case 'id':
        value = sha256(req.body.value);
        db_conn.query('UPDATE userdata SET id=\'' + value + '\' WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
          if (error) {
            console.error(error);
            res.status(500);
            // 정상 작동 여부 전송
            res.send({
              type: 'response',

              is_valid: true,
              is_vaild: true,
              is_succeed: false
            });
            return;
          }
          res.status(200);
          res.send({
            type: 'response',

            is_valid: true,
            is_vaild: true,
            is_processed: true
          });
        });
        break;
      case 'password':
        value = sha256(req.body.value);
        db_conn.query('UPDATE userdata SET pw=\'' + value + '\' WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
          if (error) {
            console.error(error);
            res.status(500);
            // 정상 작동 여부 전송
            res.send({
              type: 'response',

              is_valid: true,
              is_vaild: true,
              is_succeed: false
            });
            return;
          }
          res.status(200);
          res.send({
            type: 'response',

            is_valid: true,
            is_vaild: true,
            is_processed: true
          });
        });
        break;
      case 'nickname':
        db_conn.query('UPDATE userdata SET nickname=\'' + value + '\' WHERE pid=\'' + results[0].pid + '\'', (error, results, fields) => {
          if (error) {
            console.error(error);
            res.status(500);
            // 정상 작동 여부 전송
            res.send({
              type: 'response',

              is_valid: true,
              is_vaild: true,
              is_succeed: false
            });
            return;
          }
          res.status(200);
          res.send({
            type: 'response',

            is_valid: true,
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

          is_valid: false,
          is_vaild: false,
          error: 'Invaild Requested Data Type'
        });
    }
  });
  // password, nickname
};
