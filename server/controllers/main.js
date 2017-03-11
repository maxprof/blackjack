'use strict';

var _User = require('../Models/User');

var _User2 = _interopRequireDefault(_User);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _helpers = require('../config/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require('lodash');
var path = require('path');
var config = require('../config/secrets');


module.exports = {
    home: function home(req, res) {
        res.render('index.ejs', {
            user: req.user ? req.user : null
        });
    },

    sess: function sess(req, res) {
        res.json({ user: req.user, token: req.token });
    },

    UserSignup: function UserSignup(req, res) {
        res.render('signup.ejs');
    },

    UserSignupPost: function UserSignupPost(req, res, next) {
        var body = req.body;
        _User2.default.findOne({ nick: body.nick }).exec(function (err, user) {
            if (err) return next(err);
            if (user) return res.json({ success: false, msg: 'User already exist' });
            var newUser = new _User2.default({ nick: body.nick });
            newUser.password = newUser.generateHash(body.password);
            newUser.save(function (err, user) {
                if (err) return next(err);
                _helpers2.default.createToken(user, function (err, token) {
                    if (err) return next(err);
                    req.user = user;
                    res.cookie("token", token);
                    res.redirect('/');
                });
            });
        });
    },

    login: function login(req, res) {
        res.render('login.ejs');
    },

    Postlogin: function Postlogin(req, res, next) {
        var body = req.body;
        _User2.default.findOne({ nick: body.nick }).exec(function (err, user) {
            if (err) return next(err);
            if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
            _bcryptNodejs2.default.compare(body.password, user.password, function (err, result) {
                if (err) return next(err);
                if (result === false) {
                    return next("Bad credentials");
                }
                _helpers2.default.createToken(user, function (err, token) {
                    if (err) return next(err);
                    req.user = user;
                    res.cookie("token", token);
                    res.status(200).redirect('/');
                });
            });
        });
    },

    logout: function logout(req, res) {
        req.user = null;
        res.cookie("token", '');
        return res.status(200).redirect('/user/login');
    },
    notFound: function notFound(req, res) {
        return res.render('404.ejs');
    }
};