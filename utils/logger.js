const colors = require('colors');

class Logger {
    constructor(debug = false) {
        this.debugMode = debug;
    }

    info(message) {
        console.log(`   -[*]> ${message}`.yellow);
    }
    
    error(message) {
        console.log(`   -[-]> ${message}`.red);
    }
}

const logger = new Logger();

module.exports = logger;