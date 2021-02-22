const events = require('../scheduling/events')
const get_device = require('../tools/helpers').get_device;

// const leds = require(join(__dirname, 'led-controller'));
const bulbs = require('./bulb-controller').bulbs;
const plugs = require('./plug-controller').plugs.filter(p => p.function == 'LIGHT');


const run_on_all = (callback, only_bulbs = false) => {

    let promises = [];

    for(b in bulbs) promises.push(callback(b));

    if(!only_bulbs) {
        for(p in plugs) promises.push(callback(p));
    }

    return Promise.all(promises);

}

const get_lights_on = () => {

    return get_states().then((states) => {
        for(s of states) if(s) return true;
    });

};

const set_all = (color) => {

    // get_lights_on().then((on) => { if(!on) events.run('lights_on'); }  ); TODO: figure out how to throw this event when changed from the app

    return run_on_all((bulb) => {
        bulb.set(color);
    }, only_bulbs = true);

}

const all_on = (trans = 1000) => {

    // get_lights_on().then((on) => { if(!on) events.run('lights_on'); }  );

    return run_on_all((light) => {
        light.on();
    });

}

const all_off = (trans = 1000) => {

    // get_lights_on().then((on) => { if(on) events.run('lights_off'); }  );

    return run_on_all((light) => {
        light.off();
    });

};

const get_states = () => {

    return run_on_all((light) => light.get()) //add leds when they work lmao

};

const turn_on = (info) => {

    d = get_device(info, lights);
    return d.on()

}

const turn_off = (info) => {

    d = get_device(info, lights);
    return d.off()

}

const get = (info) => {

    d = get_device(info, lights);
    return d.get()

}

const set = (info, color) => {

    d = get_device(info, lights);
    return d.set(color)

}

const take_scene = (scene) => {

    let promises = [];

    for( config in scene.smartlights ) {
        
        d = get_device({name: config.name});

        if(config.is_on) {
            if(config.is_on) promises.push(d.set( config.color ));
        } else {
            promises.push(d.turn_off());
        }

    }

    return Promise.all(promises);

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
    all_off,
    all_on,
    get_states,
    turn_on,
    turn_off,
    get,
    set,
    take_scene,
    connect_led,
    // pingPong,
    // randomRipple,
    // cascadeOn,
    // cascadeLightMiddle,
    
};
