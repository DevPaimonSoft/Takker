class CustomError {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }

    toString() {
        return `Error ${this.code}: ${this.message}`;
    }
}

const errors = {
    // Port errors
    'cannot_check_ports': new CustomError(99983, 'Cannot checking ports availability'),
    'port_in_use': new CustomError(99984, 'Port is already in use, Trying next port...'),

    // Certificate errors
    'invalid_certificate': new CustomError(99981, 'Invalid certificate'),
    'cannot_check_certificate': new CustomError(99982, 'Cannot check certificate'),

    // Downloading errors
    'cannot_download': new CustomError(451, 'Cannot download file'),
    'cannot_download_modules': new CustomError(905515, 'Cannot download modules'),
    'cannot_download_cleaner': new CustomError('EX-9501', 'Cannot download cleaner'),

    // Internal errors
    'cannot_check_version': new CustomError(750, 'Cannot check version'),
    'cannot_check_md5': new CustomError(751, 'Cannot check MD5'),
    'md5_not_match': new CustomError(752, 'MD5 does not match'),
    
    'hider_error': new CustomError('EX-9506', 'Hider error'),
    
    // Hosts file errors
    'cannot_read_hosts': new CustomError('EX-9449', 'Cannot read hosts file'),
    'cannot_write_hosts': new CustomError('EX-9450', 'Cannot write hosts file'),
    
    // Last activity view errors
    'cannot_write_lav': new CustomError('0551', 'Cannot hide last activity view'),
    'cannot_download_lav_cleaner': new CustomError('9502', 'Cannot download last activity view cleaner'),
    'cannot_run_lav_cleaner': new CustomError('0552', 'Cannot run last activity view cleaner'),
};

module.exports = { CustomError };
module.exports.errors = errors;