const join = require('path').join;
const TPapi = require('tplink-smarthome-api');
const RGBtoHSL = require('rgb-to-hsl');

const tplinkClient = new TPapi.Client();

let bulbs = [];

tplinkClient.startDiscovery({discoveryTimeout: 5000}).on('bulb-new', (device) => { 
    bulbs.push(device); 
});

const set_bulb = (color) => {

    run_parallel((bulb) => {

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

    });

}

const off = () => {
    
    run_parallel((bulb) => {

        return bulb.lighting.setLightState({
            on_off: false,
            transition_period: 0
        });

    })

}

const run_parallel = (callback) => {

    let promises = [];

    for( bulb of bulbs ) {
        promises.push( callback(bulb) );
    }

    return Promise.all(promises);

}

module.exports = {
    set_bulb,
    off
}