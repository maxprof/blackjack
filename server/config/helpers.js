'use strict';

var _User = require('../Models/User');

var _User2 = _interopRequireDefault(_User);

var _Results = require('../Models/Results');

var _Results2 = _interopRequireDefault(_Results);

var _secrets = require('./secrets');

var _secrets2 = _interopRequireDefault(_secrets);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    createToken: function createToken(user, done) {
        var token = _jsonwebtoken2.default.sign({
            exp: (0, _moment2.default)().add(14, 'days').unix(),
            iat: (0, _moment2.default)().unix(),
            data: user._id
        }, _secrets2.default.sessionSecret);
        if (done) return done(null, token);
    },
    tokenInspection: function tokenInspection(req, res, next) {
        req.user = null;
        var token = req.cookies.token;
        if (token) {
            _jsonwebtoken2.default.verify(token, _secrets2.default.sessionSecret, function (err, decoded) {
                if (err) return res.status(501).redirect('/user/login');
                _User2.default.findById(decoded.data).exec(function (err, user) {
                    if (err) return res.status(501).redirect('/user/login');
                    if (user) {
                        req.user = user;
                        return next();
                    }
                    return res.status(404).redirect('/user/login');
                });
            });
        } else {
            return res.status(404).redirect('/user/login');
        }
    },
    saveResults: function saveResults(userId, playerScore, dealerScore, status, next) {
        _async2.default.waterfall([function (done) {
            _Results2.default.find().exec(function (err) {
                if (err) return done(err);
                var newResult = new _Results2.default();
                newResult.user = userId;
                newResult.userScore = playerScore;
                newResult.dealerScore = dealerScore;
                if (status == "true") newResult.status = true;
                newResult.save(function (err, newResult) {
                    if (err) return done(err);
                    done(null, newResult._id);
                });
            });
        }, function (result, done) {
            _User2.default.findById(userId).exec(function (err, user) {
                if (err) return done(err);
                if (!user) return done('User not found');
                user.plays.push(result);
                user.playsCount++;
                if (status == "true") user.wins++;
                user.save(function (err) {
                    if (err) return done(err);
                });
            });
        }], function (err) {
            if (err) return done(err);
        });
        next();
    }
};