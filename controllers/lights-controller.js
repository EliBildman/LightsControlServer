const join = require('path').join;
const fs = require('fs');
const RGBtoHSL = require('rgb-to-hsl');
const defaults = require('defaults');

const leds = require(join(__dirname, 'led-controller'));
const bulb = require(join(__dirname, 'bulb-controller'));




const setAll = (color) => {

    return Promise.all([
        bulb.set_bulb(color),
        leds.set_color({color})
    ]);

}

const allOff = () => {

    return Promise.all([
        bulb.off(),
        leds.off()
    ]);

}

const cascadeOn = (color) => {

    allOff()
    .then(() => leds.cascade_on({color}))
    .then(() => bulb.set_bulb(color));

}

const cascadeLightMiddle = (color) => {
    allOff()
    .then(() => leds.cascade_on({color, subset: [0, 30]}))
    .then(() => bulb.set_bulb(color))
    .then(() => leds.cascade_on({color, subset: [30, 68]}));
}


const randomRipple = (baseColor) => {
    leds.states.randomRipple(baseColor);
}

const pingPong = (settings) => {
    settings = defaults(settings, {
        baseColor: [255, 255, 255]
    });

    bulb.set_bulb(settings.baseColor)
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
    connect_led,
    cascadeLightMiddle,
    
}