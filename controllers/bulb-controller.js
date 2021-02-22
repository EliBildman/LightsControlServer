const tpapi = require('tplink-lightbulb');
const RGBtoHSL = require('rgb-to-hsl');
const device_configs = require('../configs/devices-config.json');

const tp_controller = require('./tp-controller');

let bulbs = [];

tp_controller.when_ready.push(() => {
    bulbs = tp_controller.devices['IOT.SMARTBULB'].map((b) => {
        return {
            name: b.name,
            mac: b.mac,
            type: b.device,
            on: () => turn_on(b.device),
            off: () => turn_off(b.device),
            get: () => get_on(b.device),
            set: (color) => set(b.device, color)
        };
    });
    bulbs[0].set([0, 0, 100]);
    bulbs[1].set([0, 0, 100]);
});


const set = (bulb, color, trans = 1) => {

    [hue, sat, lit] = RGBtoHSL(color[0], color[1], color[2]);
    hue = parseInt(hue);
    saturation = parseInt(sat.substring(0, sat.length - 1));
    brightness = parseInt(lit.substring(0, lit.length - 1));

    return bulb.power(true, trans, options = {
        hue,
        saturation,
        brightness
    });
}

const turn_on = (bulb, trans = 1000) => {

    return bulb.power(true, trans);

}

const turn_off = (bulb, trans = 1000) => {

    return bulb.power(false, trans);

}

const get_on = (bulb) => {

    return bulb.info().then((info) => info.light_state);

}

module.exports = {
    bulbs
};
