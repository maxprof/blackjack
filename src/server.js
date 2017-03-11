import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import busboy from 'busboy-body-parser';
import path from 'path';
const helper = require('./config/helper.js');

const logger = require('morgan');
const vLogger = require('log4js').getLogger();
const errorHandler = require('errorhandler');
const cookieParser = require('cookie-parser');

const secrets = require('./config/secrets');
const helpers = require('./config/helpers');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

app.use(logger('dev'));
app.use(errorHandler());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');
app.set('port', secrets.port);
app.use(express.static(path.join(__dirname)));

mongoose.connect(secrets.db);
mongoose.connection
    .on('error', function() {
        vLogger.warn('MongoDB Connection Error. Make sure MongoDB is running.');
    })
    .on('connected', function(){
        vLogger.info('MongoDB connected successfully.');
        require('./config/routes')(app, helpers)
    });

require('./config/routes.js')(app);

server.listen(app.get('port'), ()=> {
    console.log(`Server running on port:${app.get('port')}`);
});
io.sockets
    .on('connection', (socket) => {
        socket.on("sendUser", (user)=>{
            socket.user_id = user;
        });
        socket.on('playerLoose', ( playerScore, dealerScore, done)=>{
          helpers.saveResults(socket.user_id, playerScore, dealerScore, "false", (err) => {
              socket.emit('reload');
          });
        });

        socket.on('draw', ( playerScore, dealerScore)=>{
          helpers.saveResults(socket.user_id, playerScore, dealerScore, "false", (err) => {
            socket.emit('reload');
          });
        });

        socket.on('playerWin', ( playerScore, dealerScore)=>{
          helpers.saveResults(socket.user_id, playerScore, dealerScore, "true", (err) => {
            socket.emit('reload');
          });
        });
      });