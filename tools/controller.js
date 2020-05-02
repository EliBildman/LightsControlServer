const join = require('path').join;
const fs = require('fs');
const RGBtoHSL = require('rgb-to-hsl');
const defaults = require('defaults');

const leds = require(join(__dirname, 'ledcontroller'));
const bulb = require(join(__dirname, 'tpcontroller'));




const setAll = (color, next) => {

    return bulb.setBulb(color)
    .then(() => { leds.anis.setAllLeds(color); });


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

    leds.states.pingPong({baseColor: settings.BaseColor});
}


module.exports = {
    pingPong,
    setAll,
    allOff,
    randomRipple,
    cascadeOn,
}