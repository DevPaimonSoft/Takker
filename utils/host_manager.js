const fs = require('fs');
const os = require('os');

function init() {
    const hostsFile = getHostsFilePath();
    let hostsContent = fs.readFileSync(hostsFile, 'utf-8');

    const startMarker = '# —takker—';
    const endMarker = '# —takker-end—';
    if (hostsContent.includes(startMarker) && hostsContent.includes(endMarker)) {
        return;
    }

    hostsContent += `\n# —takker—\n# —takker-end—\n`;

    fs.writeFileSync(hostsFile, hostsContent, 'utf-8');
}

function changeHosts(host, revert) {
    const hostsFile = getHostsFilePath();
    let hostsContent = fs.readFileSync(hostsFile, 'utf-8');

    const startMarker = '# —takker—';
    const endMarker = '# —takker-end—';
    const startPos = hostsContent.indexOf(startMarker) + startMarker.length;
    const endPos = hostsContent.indexOf(endMarker);

    if (startPos > 0 && endPos > 0) {
        let sectionContent = hostsContent.substring(startPos, endPos);

        if (revert) {
            sectionContent = sectionContent.replace(`\n0.0.0.0 ${host}`, '');
        } else {
            sectionContent = `\n0.0.0.0 ${host}` + sectionContent;
        }

        hostsContent = hostsContent.substring(0, startPos) + sectionContent + hostsContent.substring(endPos);
        fs.writeFileSync(hostsFile, hostsContent, 'utf-8');
    }
}

function clear() {
    const hostsFile = getHostsFilePath();
    let hostsContent = fs.readFileSync(hostsFile, 'utf-8');

    const startMarker = '# —takker—';
    const endMarker = '# —takker-end—';
    const startPos = hostsContent.indexOf(startMarker);
    const endPos = hostsContent.indexOf(endMarker) + endMarker.length;

    if (startPos > 0 && endPos > 0) {
        hostsContent = hostsContent.substring(0, startPos) + hostsContent.substring(endPos);
        fs.writeFileSync(hostsFile, hostsContent, 'utf-8');
    }
}

function getHostsFilePath() {
    return os.platform() === 'win32' ? 'C:\\Windows\\System32\\drivers\\etc\\hosts' : '/etc/hosts';
}

module.exports = {
    init,
    changeHosts,
    clear
};
