'use strict';

module.exports = function (app) {
    var main_controller = require('../controllers/main.js');
    var helpers = require('../config/helpers.js');

    app.all('*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
        if (req.method == 'OPTIONS') {
            res.status(200).end();
        } else {
            next();
        }
    });
    app.get('/', helpers.tokenInspection, main_controller.home);
    app.post('/user/signup', main_controller.UserSignupPost);
    app.get('/user/signup', main_controller.UserSignup);
    app.get('/user/login', main_controller.login);
    app.post('/user/login', main_controller.Postlogin);
    app.get('/logout', main_controller.logout);
    app.get('/sess', helpers.tokenInspection, main_controller.sess);
    app.get('/user/id:id', helpers.tokenInspection, main_controller.userProfile);
    app.use(function (err, req, res, next) {
        if (err) return res.status(err.status).send(err.message);
        next();
    });
};