const join = require('path').join;
const fs = require('fs');
const RGBtoHSL = require('rgb-to-hsl');
const defaults = require('defaults');
const events = require('../scheduling/events')

const leds = require(join(__dirname, 'led-controller'));
const bulbs = require(join(__dirname, 'bulb-controller'));

const get_lights_on = () => {

    return get_states().then((states) => {
        for(light in states) {
            if(states[light].on_off) return true;
        }
        return false;
    });

};

const set_all = (color) => {


    get_lights_on().then((on) => { if(!on) events.run('lights_on'); }  );


    return Promise.all([
        bulbs.set_bulb(color),
        leds.set_color({color})
    ]);

}

const on = (trans = 1000) => {

    get_lights_on().then((on) => { if(!on) events.run('lights_on'); }  );

    return Promise.all([
        bulbs.on(trans),
        // leds.on()
    ]);

}

const off = (trans = 1000) => {

    get_lights_on().then((on) => { if(on) events.run('lights_off'); }  );

    return Promise.all([
        bulbs.off(trans),
        // leds.off()
    ]);

};

const get_states = () => {

    return bulbs.get_state(); //add leds when they work lmao

};


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

    get_lights_on,
    set_all,
    off,
    on,
    get_states,
    connect_led,
    // pingPong,
    // randomRipple,
    // cascadeOn,
    // cascadeLightMiddle,
    
}