const tpapi = require('tplink-lightbulb');
const device_configs = require('../configs/devices-config.json');

const tp_controller = require('./tp-controller');

let plugs = [];

tp_controller.when_ready.push(() => {
    plugs = tp_controller.devices['IOT.SMARTPLUGSWITCH'].map((p) => {
        return {
            name: p.name,
            mac: p.mac,
            type: p.device,
            on: () => turn_on(p.device),
            off: () => turn_off(p.device),
            get: () => get(p.device),
        };
    });
});

const turn_on = (plug) => {

    return plug.power(true);

};

const turn_off = (plug) => {

    return plug.power(false);

};

const get = (plug) => {

    return plug.info().then(info => info.relay_state == 1);

};

module.exports = {
    plugs
};

