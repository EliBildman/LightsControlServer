const join = require('path').join;
// const TPapi = require('tplink-smarthome-api');
const tpapi = require('tplink-lightbulb');
const RGBtoHSL = require('rgb-to-hsl');
const device_configs = require('../configs/devices-config.json');
// const tplinkClient = new TPapi.Client();

const bulb_macs =  device_configs.smartlights.map(d => d.mac.replace(/:/g, ''));
let bulbs = [];

// tplinkClient.startDiscovery({discoveryTimeout: 5000}).on('bulb-new', (device) => { 
//     bulbs.push(device); 
// });

const scan = tpapi.scan().on('light', light => {

    light.info().then((info) => {
        if(info.mic_mac && bulb_macs.includes(info.mic_mac)) {

            light.power(!info.light_state.on_off).then(() => { light.power(info.light_state.on_off) }); 
            bulbs.push(light);
            console.log(`Registered new light: ${info.alias}`);

            if(bulbs.length == bulb_macs.length) {
                scan.stop();
            }
            
        }
    });

});

const set_bulbs = (color, trans = 1) => {

    run_parallel((bulb) => {

        [hue, sat, lit] = RGBtoHSL(color[0], color[1], color[2]);
        hue = parseInt(hue);
        saturation = parseInt(sat.substring(0, sat.length - 1));
        brightness = parseInt(lit.substring(0, lit.length - 1));

        return bulb.power(true, trans, {
            hue,
            saturation,
            brightness
        });

    });

}

const on = (trans = 1000) => {

    run_parallel((bulb) => {
        return bulb.power(true, trans);
    })

}

const off = (trans = 1000) => {

    run_parallel((bulb) => {
        return bulb.power(false, trans);
    });

}

const run_parallel = (callback) => {

    let promises = [];

    for( bulb of bulbs ) {
        promises.push( callback(bulb) );
    }

    return Promise.all(promises);

}

module.exports = {
    set_bulbs,
    off,
    on
};
