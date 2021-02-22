const computer_controller = require('./computer-controller');
const plug_controller = require('./plug-controller');

const get_device = require('../tools/helpers').get_device;

const devices = computer_controller.computers.concat(plug_controller.plugs);

const turn_on = (info) => {

    d = get_device(info, devices);
    return d.on()

}

const turn_off = (info) => {

    d = get_device(info, devices);
    return d.off()

}

const get = (info) => {

    d = get_device(info, devices);
    return d.get()

}

const take_scene = (scene) => {

    let promises = [];

    for( config in scene.toggleables ) {
        
        d = get_device({name: config.name});

        if(config.is_on) {
            if(config.is_on) promises.push(d.turn_on());
        } else {
            promises.push(d.turn_off());
        }

    }

    return Promise.all(promises);

};


module.exports = {
    take_scene,
    turn_on,
    turn_off,
    get,
}