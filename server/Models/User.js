'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userSchema = new _mongoose2.default.Schema({
  password: String,
  nick: {
    type: String,
    unique: true
  },
  plays: [{
    type: _mongoose2.default.Schema.Types.ObjectId,
    ref: 'Results'
  }],
  wins: {
    type: Number,
    default: 0
  },
  playsCount: {
    type: Number,
    default: 0
  }
});

userSchema.methods.generateHash = function (pass) {
  return _bcryptNodejs2.default.hashSync(pass, _bcryptNodejs2.default.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (pass, done) {
  _bcryptNodejs2.default.compare(pass, this.password, function (err, is) {
    done(null, is);
  });
};
exports.default = _mongoose2.default.model('User', userSchema);