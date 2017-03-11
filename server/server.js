'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _busboyBodyParser = require('busboy-body-parser');

var _busboyBodyParser2 = _interopRequireDefault(_busboyBodyParser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var helper = require('./config/helper.js');

var logger = require('morgan');
var vLogger = require('log4js').getLogger();
var errorHandler = require('errorhandler');
var cookieParser = require('cookie-parser');

var secrets = require('./config/secrets');
var helpers = require('./config/helpers');

var app = (0, _express2.default)();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(logger('dev'));
app.use(errorHandler());
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use((0, _busboyBodyParser2.default)());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');
app.set('port', secrets.port);
app.use(_express2.default.static(_path2.default.join(__dirname)));

_mongoose2.default.connect(secrets.db);
_mongoose2.default.connection.on('error', function () {
    vLogger.warn('MongoDB Connection Error. Make sure MongoDB is running.');
}).on('connected', function () {
    vLogger.info('MongoDB connected successfully.');
    require('./config/routes')(app, helpers);
});

require('./config/routes.js')(app);

server.listen(app.get('port'), function () {
    console.log('Server running on port:' + app.get('port'));
});
io.sockets.on('connection', function (socket) {
    socket.on("sendUser", function (user) {
        socket.user_id = user;
    });
    socket.on('playerLoose', function (playerScore, dealerScore, done) {
        helpers.saveResults(socket.user_id, playerScore, dealerScore, "false", function (err) {
            socket.emit('reload');
        });
    });

    socket.on('draw', function (playerScore, dealerScore) {
        helpers.saveResults(socket.user_id, playerScore, dealerScore, "false", function (err) {
            socket.emit('reload');
        });
    });

    socket.on('playerWin', function (playerScore, dealerScore) {
        helpers.saveResults(socket.user_id, playerScore, dealerScore, "true", function (err) {
            socket.emit('reload');
        });
    });
});