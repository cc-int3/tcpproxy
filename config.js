"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remoteConfig = exports.localConfig = void 0;
exports.localConfig = {
    host: 'https://devmtx.myhost.meditech.com:8443',
    client: {
        id: 'testClient',
        secret: 'testSecret'
    },
    auth: {
        tokenEndpoint: '/oauth/token'
    }
};
exports.remoteConfig = {
    host: 'https://devmtx-restapis-dev.meditech.com',
    client: {
        id: 'smithgrege_dev',
        secret: 'xQNxalReS0O2t1ON8Hp5kA=='
    },
    auth: {
        tokenEndpoint: '/oauth/token'
    }
};
