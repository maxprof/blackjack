let env = process.env.NODE_ENV || 'dev';
let config = {
    production: {
    },
    dev: {
        port: process.env.PORT || 5000,
        db: 'mongodb://localhost:27017/BlackJack',
        sessionSecret: 'superSecret',
        token: 'superToken',
        files: 'public/uploads'
    }
};


module.exports = config[env];
