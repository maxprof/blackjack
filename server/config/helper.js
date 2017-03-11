'use strict';

var _User = require('../Models/User');

var _User2 = _interopRequireDefault(_User);

var _secrets = require('./secrets');

var _secrets2 = _interopRequireDefault(_secrets);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

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
                if (err) return res.status(501).send("Bad token");
                _User2.default.findById(decoded.data).exec(function (err, user) {
                    if (err) return res.status(501).send('/user/login');
                    if (user) {
                        req.user = user;
                        req.reqUser = user;
                        return next();
                    }
                    return res.status(404).send('/user/login');
                });
            });
        } else {
            return res.status(404).redirect('/user/login');
        }
    },
    newError: function newError(msg, status, done) {
        var error = {
            message: msg,
            status: status
        };
        done(error);
    },
    SignupValidation: function SignupValidation(user, done) {
        var schema = _joi2.default.object().keys({
            name: _joi2.default.string().alphanum().min(3).max(30).required(),
            surname: _joi2.default.string().alphanum().min(3).max(30).required(),
            email: _joi2.default.string().email().required(),
            password: _joi2.default.string().regex(/^[a-zA-Z0-9]{3,30}$/)
        });
        _joi2.default.validate(user, schema, function (err) {
            if (err) return done(err);
            done(null);
        });
    },
    LoginValidation: function LoginValidation(user, done) {
        var schema = _joi2.default.object().keys({
            email: _joi2.default.string().email().required(),
            password: _joi2.default.string().regex(/^[a-zA-Z0-9]{3,30}$/)
        });
        _joi2.default.validate(user, schema, function (err) {
            if (err) return done(err);
            done(null);
        });
    }
};