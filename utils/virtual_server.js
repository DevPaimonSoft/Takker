const mc = require('minecraft-protocol');
const EventEmitter = require('events');

class VirtualServer extends EventEmitter {
    constructor(targetHost, targetPort, version, port) {
        super();
        this.targetHost = targetHost;
        this.targetPort = targetPort;
        this.version = version;
        this.port = port;
    }

    async getServerInfo(address) {
        try {
            const response = await fetch(`https://api.mcstatus.io/v2/status/java/${address}`);
            return await response.json();
        } catch {
            return null;
        }
    }

    async createServer() {
        const address = `${this.targetHost}:${this.targetPort}`;

        const virtualServer = await mc.createServer({
            'online-mode': false,
            port: this.port,
            version: this.version,
            keepAlive: false,
        });

        virtualServer.playerCount = 13;

        virtualServer.on('login', (client) => this.emit('login', client));
        virtualServer.on('end', (client) => this.emit('end', client));
        virtualServer.on('packet', (data, meta) => this.emit('packet', data, meta));

        return virtualServer;
    }
}

module.exports = VirtualServer;