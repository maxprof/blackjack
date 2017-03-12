import Users from '../Models/User';
import mongoose from 'mongoose';
import async from 'async';
import helpers from '../config/helpers';
import bcrypt from 'bcrypt-nodejs';
const _ = require('lodash');
const path = require('path');
const config = require('../config/secrets');
import jwt from 'jsonwebtoken';


module.exports = {
    home: (req, res) => {
        res.render('index.ejs', {
            user: req.user ? req.user : null
        });
    },

    sess: (req, res) => {
        res.json({user: req.user, token: req.token})
    },

    UserSignup: (req, res) =>{
        res.render('signup.ejs');
    },

    UserSignupPost: (req, res, next) => {
        let body = req.body;
        Users
            .findOne({nick: body.nick})
            .exec((err, user) => {
                if (err) return next(err);
                if (user) return res.json({success: false, msg: 'User already exist'});
                let newUser = new Users({nick: body.nick});
                newUser.password = newUser.generateHash(body.password);
                newUser.save((err, user) => {
                    if (err) return next(err);
                    helpers.createToken(user, (err, token) => {
                        if (err) return next(err);
                        req.user = user;
                        res.cookie("token", token);
                        res.redirect('/');
                    });
                })
            })

    },

    login: (req, res) => {
        res.render('login.ejs');
    },

    Postlogin: (req, res, next) => {
        let body = req.body;
        Users
            .findOne({nick: body.nick})
            .exec((err, user)=>{
                if (err) return next(err);
                if (!user) return res.status(404).redirect('/404');
                bcrypt.compare(body.password, user.password, (err, result) => {
                    if (err) return next(err);
                    if (result === false) {
                        return next("Bad credentials");
                    }
                    helpers.createToken(user, (err, token) => {
                        if (err) return next(err);
                        req.user = user;
                        res.cookie("token", token);
                        res.status(200).redirect('/');
                    });
                });
            });
    },

    logout: (req, res) => {
        req.user = null;
        res.cookie("token", '');
        return res.status(200).redirect('/user/login');
    },
    notFound: (req, res) => {
        return res.render('404.ejs');
    }
};
