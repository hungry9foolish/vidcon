const winston = require('winston');
const { format, createLogger, transports } = winston;

// define the custom settings for each transport (file, console)
var options = {
    file: {
        level: 'error',
        filename: `./logs/error.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.errors({ stack: true }),
            format.splat(),
            format.json()
        ),
    },
    morganLogger: {
        level: 'info',
        format: format.combine(
            format.simple(),
            format.splat(),
        ),
        filename: './logs/http.log'
    }
};

winston.loggers.add('morganLogger', {
    transports: [
        new transports.File(options.morganLogger)
    ]
});

const logger = createLogger({
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`.
        // - Write all logs error (and below) to `quick-start-error.log`.
        //
        new transports.File(options.file),
        new transports.File({ ...options.file, filename: './logs/combined.log', level: 'info' })
    ],
    exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple(),
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
        )
    }));
}

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function (message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        const mLogger = winston.loggers.get('morganLogger')
        mLogger.info(message);
    },
};

module.exports = logger;