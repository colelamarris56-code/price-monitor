/**
 * Simple logger utility
 */
class Logger {
    info(message, data) {
        this.log('INFO', message, data);
    }

    warn(message, data) {
        this.log('WARN', message, data);
    }

    error(message, data) {
        this.log('ERROR', message, data);
    }

    debug(message, data) {
        if (process.env.DEBUG === 'true') {
            this.log('DEBUG', message, data);
        }
    }

    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${level}: ${message}`;

        if (data) {
            console.log(logMessage, data);
        } else {
            console.log(logMessage);
        }
    }
}

module.exports = new Logger();