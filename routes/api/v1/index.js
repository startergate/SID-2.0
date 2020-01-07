/* jshint esversion: 9 */

const express = require('express');

const controller = require('./v1.controller');

const router = express.Router();

/* login related functions. */
router.post('/session', controller.createSession);

router.post('/user', controller.createUser);

router.delete('/session', controller.deleteSession);

router.get('/convert/id/:id', controller.convertIdToPid);

/* info modifier. */
router.get('/:clientid/:sessid/:data', controller.getUserInfo);

router.post('/:data/', controller.createUserInfo);

router.post('/:data/verify', controller.verifyUserInfo);

router.get('/:type/:data/exist/bool', controller.checkExistData);

// modify
router.put('/:data', controller.modifyUserData);

router.all('*', controller.rootRequest);
module.exports = router;
