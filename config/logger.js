var winston = require('winston');
var DailyRotateFile = require('winston-daily-rotate-file');
var path = require('path');

//timezone 에 관련된 모듈.
var moment = require('moment-timezone');
var timeZone = "Asia/Seoul";

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            silent: false,
            colorize: true,
            prettyPrint: true,
            timestamp: function() {
                return moment().tz(timeZone).format();
            }
        }),
        new winston.transports.DailyRotateFile({
            level: 'debug',
            silent: false,
            colorize: false,
            prettyPrint: true,
            timestamp: function() {
                return moment().tz(timeZone).format();
            },
            dirname: path.join(__dirname, '../logs'),
            filename: 'debug_logs_',
            datePattern: 'yyyy-MM-ddTHH.log',
            maxsize: 1024*1024*5,
            json: false
        })
    ],
    exceptionHandlers: [
        new winston.transports.DailyRotateFile({
            silent: false,
            colorize: false,
            prettyPrint: true,
            timestamp: function() {
                return moment().tz(timeZone).format();
            },
            dirname: path.join(__dirname, '../logs'),
            filename: 'exception_logs_',
            datePattern: 'yyyy-MM-ddTHH-mm.log',
            maxsize: 1024,
            json: false,
            handleExceptions: true,
            humanReadableUnhandledException: true
        })
    ],
    exitOnError: false
});

module.exports = logger;