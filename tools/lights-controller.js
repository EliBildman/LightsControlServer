const join = require('path').join;
const fs = require('fs');
const RGBtoHSL = require('rgb-to-hsl');
const defaults = require('defaults');

const leds = require(join(__dirname, 'led-controller'));
const bulb = require(join(__dirname, 'tp-controller'));




const setAll = (color, next) => {

    return bulb.setBulb(color)
    .then(() => { leds.set_color(color); });

}

const allOff = (next) => {

    return bulb.bulbOff()
    .then(() => leds.anis.setAllLeds([0, 0, 0]));

}

const cascadeOn = (color) => {

    allOff()
    .then(() => leds.anis.cascadeLeds(50, color))
    .then(() => bulb.setBulb(color));

}


const randomRipple = (baseColor) => {
    leds.states.randomRipple(baseColor);
}

const pingPong = (settings) => {
    settings = defaults(settings, {
        baseColor: [255, 255, 255]
    });

    bulb.setBulb(settings.baseColor)
    .then(() => { leds.states.pingPong({
        refreshRate: 60,
        baseColor: settings.baseColor,
        pingSpeed: 40,
        numPings: 2,
        pingSize: 10,
        pingSpacing: 20,
        alternateDir: true,
        auxColors: [[100, 100, 0], [100, 100, 100]]
    }) });
}

const connect_led = (ws) => {

    leds.new_strip(ws);

}

module.exports = {

    pingPong,
    setAll,
    allOff,
    randomRipple,
    cascadeOn,
    connect_led
    
}