const sidUniversal = require('../../modules/sidUniversal');

exports.index = (req, res, next) => {
  res.redirect('/user/info');
};

exports.info = (req, res, next) => {
  if (!sidUniversal.jsonChecker(req.query, ['sessid'], [true])) {
    res.render('user/login.ejs');
    return;
  }
  res.render('user/info', {
    nickname: req.session.sidNickname,
    id: req.session.sidUser,
    password: req.session.sidPassword
  });
};

exports.login = (req, res, next) => {
  if (sidUniversal.jsonChecker(req.query, ['sessid'], [true])) {
    res.redirect('/user/info');
    return;
  }
  res.render('user/login', {
    clientid: req.query.clientid,
    headTo: req.query.headTo
  });
};
