const join = require('path').join;
const fs = require('fs');
const RGBtoHSL = require('rgb-to-hsl');
const defaults = require('defaults');
const events = require('../scheduling/events')

const leds = require(join(__dirname, 'led-controller'));
const bulbs = require(join(__dirname, 'bulb-controller'));

let lights_on = false;

const set_all = (color) => {

    if(!lights_on) events.run('lights_on');
    lights_on = true;

    return Promise.all([
        bulbs.set_bulb(color),
        leds.set_color({color})
    ]);

}

const on = (trans = 1000) => {

    if(!lights_on) events.run('lights_on');
    lights_on = true;

    return Promise.all([
        bulbs.on(trans),
        // leds.on()
    ]);

}

const off = (trans = 1000) => {

    if(lights_on) events.run('lights_off');
    lights_on = false;

    return Promise.all([
        bulbs.off(trans),
        // leds.off()
    ]);

}

// const cascadeOn = (color) => {

//     if(!lights_on) events.run('lights_on');
//     lights_on = true;

//     allOff()
//     .then(() => leds.cascade_on({color}))
//     .then(() => bulb.set_bulb(color));

// }

// const cascadeLightMiddle = (color) => {
//     allOff()
//     .then(() => leds.cascade_on({color, subset: [0, 30]}))
//     .then(() => bulb.set_bulb(color))
//     .then(() => leds.cascade_on({color, subset: [30, 68]}));
// }


// const randomRipple = (baseColor) => {
//     leds.states.randomRipple(baseColor);
// }

// const pingPong = (settings) => {
//     settings = defaults(settings, {
//         baseColor: [255, 255, 255]
//     });

//     bulb.set_bulb(settings.baseColor)
//     .then(() => { leds.states.pingPong({
//         refreshRate: 60,
//         baseColor: settings.baseColor,
//         pingSpeed: 40,
//         numPings: 2,
//         pingSize: 10,
//         pingSpacing: 20,
//         alternateDir: true,
//         auxColors: [[100, 100, 0], [100, 100, 100]]
//     }) });
// }

const connect_led = (ws) => {

    leds.new_strip(ws);

}

module.exports = {

    // pingPong,
    set_all,
    off,
    on,
    // randomRipple,
    // cascadeOn,
    connect_led,
    // cascadeLightMiddle,
    
}