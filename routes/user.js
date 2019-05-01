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

router.put('/edit/:type', (req, res, next) => {
  switch (req.params.type) {
    case 'id':

      break;
    case 'pw':

      break;
    case 'pfimg':

      break;
    default:
      req.send({
        'type': 'error',
        'error': true
      });
  }
});

module.exports = router;