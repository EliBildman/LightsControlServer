const join = require('path').join;
const fs = require('fs');
const RGBtoHSL = require('rgb-to-hsl');

const leds = require(join(__dirname, 'ledcontroller'));
const bulb = require(join(__dirname, 'tpcontroller'));




const setAll = (color, next) => {

    return bulb.setBulb(color)
    .then(() => { leds.setAllLeds(color); });


}

const allOff = (next) => {

    return bulb.bulbOff()
    .then(() => leds.setAllLeds([0, 0, 0]));

}

const cascadeOn = (color) => {

    allOff()
    .then(() => leds.cascadeLeds(50, color))
    .then(() => bulb.setBulb(color));

}


const randomRipple = (baseColor) => {
    leds.randomRipple(baseColor);
}


module.exports = {
    setAll,
    allOff,
    randomRipple,
    cascadeOn,
}