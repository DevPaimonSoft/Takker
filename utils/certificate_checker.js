const https = require('https');
const crypto = require('crypto');

function getCertificateFingerprint(hostname) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: hostname,
            port: 443,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            const certificate = res.socket.getPeerCertificate();
            if (!certificate || !certificate.raw) {
                reject(new Error('Could not get certificate'));
                return;
            }

            const fingerprint = crypto.createHash('sha256').update(certificate.raw).digest('hex');
            resolve(fingerprint);
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

module.exports = { getCertificateFingerprint };