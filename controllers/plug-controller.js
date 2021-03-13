const tp_controller = require('./tp-controller');

let plugs = [];

tp_controller.when_ready.push(() => {
    plugs = tp_controller.devices['IOT.SMARTPLUGSWITCH'].map((p) => {
        return {
            name: p.name,
            mac: p.mac,
            type: p.type,
            function: p.function,
            on: () => turn_on(p.device),
            off: () => turn_off(p.device),
            get: () => get(p.device),
        };
    });
});

const get_plugs = (_function = null) => {

    if(_function == null) {
        return plugs;
    } else {
        return plugs.filter(p => p.function == _function);
    }

};  

const turn_on = (plug) => {

    return plug.power(true);

};

const turn_off = (plug) => {

    return plug.power(false);

};

const get = (plug) => {

    return plug.info().then(info => {
        return {
            name: plug.name,
            on_off: info.relay_state == 1,
            type: 'plug'
        }
    });

};

module.exports = {
    get_plugs
};

