/*jshint esversion: 9 */

var express = require('express');
var session = require('express-session');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.redirect('/user/info');
});

router.get('/info', (req, res, next) => {
  if (!jsonChecker(req.query, ['sessid'], [true])) {
    res.render('user/login.ejs');
    return;
  }
  res.render('user/info', {
    'nickname': req.session.sidNickname,
    'id': req.session.sidUser,
    'password': req.session.sidPassword
  });
});

router.get('/login', (req, res, next) => {
  if (jsonChecker(req.query, ['sessid'], [true])) {
    res.redirect('/user/info');
    return;
  }
  res.render('user/login', {
    'clientid': req.query.clientid,
    'headTo': req.query.headTo
  });
});

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