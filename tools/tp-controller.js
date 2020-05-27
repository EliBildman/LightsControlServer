const join = require('path').join;
const leds = require('rpi-ws281x');
const TPapi = require('tplink-smarthome-api');
const RGBtoHSL = require('rgb-to-hsl');

const tplinkClient = new TPapi.Client();

let bulb;
tplinkClient.startDiscovery({macAddresses: ['AC84C67E9327']}).on('bulb-new', (device) => { 
    bulb = device; 
    // bulb.lighting.setLightState({on_off: false});
    tplinkClient.stopDiscovery(); 
});

const setBulb = (color) => {
    [hue, sat, lit] = RGBtoHSL(color[0], color[1], color[2]);
    hue = parseInt(hue);
    sat = parseInt(sat.substring(0, sat.length - 1));
    lit = parseInt(lit.substring(0, lit.length - 1));

    return bulb.lighting.setLightState({
        on_off: true,
        hue: hue,
        saturation: sat,
        transition_period: 0,
        brightness: lit,
        color_temp: 0
    });
}

const bulbOff = () => {
    return bulb.lighting.setLightState({
        on_off: false,
        transition_period: 0
    });
}

module.exports = {
    setBulb,
    bulbOff
}