const wsUrl = 'wss://domains-ws.revved.com/v1/ws?batch=true';
const wsReqId = '156629509576';

class NameCheapApi {
    _socket = null;
    _connected = false;
    _sent = new Set();

    constructor(onStatus) {
        this.onStatus = onStatus;
    }

    check = domains => {
        domains = domains.map(e => e.replace(/ +/g, '').toLowerCase()).slice(0, NameCheapApi.limit);

        if (!domains.length) return [];

        const data = {
            type: 'domainStatus',
            reqID: wsReqId,
            data: {
                domains
            }
        };

        this._sent = new Set([...this._sent, ...domains]);
        this._connect(() => this._socket.send(JSON.stringify(data)));

        return domains;
    }

    _onReceived = ({data}) => {
        const msg = JSON.parse(data);
        if (msg.type != 'domainStatusResponse') return;

        const domain = msg.data;
        const name = domain.name.toLowerCase();
        if (!this._sent.has(name)) return;

        this._sent.delete(name);
        this.onStatus(name, domain.available, domain.error);
    }

    _connect = onReady => {
        if (this._connected) {
            onReady();
            return;
        }

        if (this._socket) {
            this._socket.onopen = null;
            this._socket.onclose = null;
            this._socket.onmessage = null;
            if (this._socket.readyState === WebSocket.OPEN) {
                this._socket.close();
            }
        }

        this._socket = new WebSocket(wsUrl);

        this._socket.onopen = () => {
            this._connected = true;
            onReady();
        }

        this._socket.onclose = e => {
            this._connected = false;
            this._socket = null;

            if (this._sent.size > 0) {
                setTimeout(() => this._connect(onReady), NameCheapApi.reconnect);
            }
        }

        this._socket.onmessage = this._onReceived;
    }
};

NameCheapApi.reconnect = 5000;
NameCheapApi.limit = 5000;

export default NameCheapApi;