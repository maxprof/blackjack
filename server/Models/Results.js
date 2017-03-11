'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var resultsSchema = new _mongoose2.default.Schema({
  user: {
    type: _mongoose2.default.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    default: false,
    type: Boolean
  },
  userScore: String,
  dealerScore: String
});

exports.default = _mongoose2.default.model('Results', resultsSchema);