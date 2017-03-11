import User from '../Models/User';
import Result from '../Models/Results';
import secrets from './secrets';
import jwt from 'jsonwebtoken';
import moment from 'moment'
import Joi from 'joi';
import async from 'async';
module.exports = {
    createToken: (user, done) => {
        let token = jwt.sign({
            exp: moment().add(14, 'days').unix(),
            iat: moment().unix(),
            data: user._id
        }, secrets.sessionSecret);
        if (done) return done(null, token);
    },
    tokenInspection:  (req, res, next) => {
        req.user = null;
        let token = req.cookies.token;
        if (token) {
            jwt.verify(token, secrets.sessionSecret, (err, decoded) => {
                if (err) return res.status(501).redirect('/user/login');
                User
                    .findById(decoded.data)
                    .exec((err, user)=> {
                        if (err) return res.status(501).redirect('/user/login');
                        if (user) {
                            req.user = user;
                            return next()
                        }
                        return res.status(404).redirect('/user/login');
                    })
            });
        } else {
            return res.status(404).redirect('/user/login');
        }
    },
    saveResults: (userId, playerScore, dealerScore, status, next)=> {
      async.waterfall([
        (done)=>{
          Result
            .find()
            .exec((err)=>{
              if (err) return done(err);
              let newResult = new Result();
                newResult.user = userId;
                newResult.userScore = playerScore;
                newResult.dealerScore = dealerScore;
                if (status == "true") newResult.status = true;
                newResult.save((err, newResult)=>{
                  if (err) return done(err);
                  done(null, newResult._id)
                })
            })
        },
        (result, done)=>{
          User
            .findById(userId)
            .exec((err, user)=>{
              if (err) return done(err);
              if (!user) return done('User not found');
              user.plays.push(result);
              user.playsCount++;
              if (status == "true") user.wins++;
              user.save((err)=>{
                if (err) return done(err);
              })
            })
        }
      ], (err)=>{
          if (err) return done(err);
      })
      next();
    }
};
