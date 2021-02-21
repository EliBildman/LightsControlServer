const join = require('path').join;
// const TPapi = require('tplink-smarthome-api');
const tpapi = require('tplink-lightbulb');
const RGBtoHSL = require('rgb-to-hsl');
const device_configs = require('../configs/devices-config.json');
// const tplinkClient = new TPapi.Client();

const bulb_macs =  device_configs.smartlights.map(d => d.mac.replace(/:/g, ''));
const plug_macs = device_configs.plugs.filter(d => d.function == 'LIGHT').map(p => p.mac);
let bulbs = [];
let plugs = [];

// console.log(light_macs);

const scan = tpapi.scan().on('light', device => {

    device.info().then((info) => {

        let mac;
        if(info.mac) mac = info.mac;
        if(info.mic_mac) mac = info.mic_mac;

        if( bulb_macs.includes(mac) ) {
            // console.log(info);

            device.power(!info.light_state.on_off).then(() => { device.power(info.light_state.on_off) }); 
            bulbs.push(device);
            console.log(`Registered new smart-bulb light: ${info.alias}`);

            
        } else if ( plug_macs.includes(mac) ) {
            
            device.power(!info.relay_state).then(() => { device.power(info.relay_state) }); 
            plugs.push(device);
            console.log(`Registered new smart-plug light: ${info.alias}`);

        }

        if(bulbs.length + plugs.length == plug_macs.length + bulb_macs.length) {
            scan.stop();
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

    return run_parallel((device) => {
        return device.power(true, trans);
    }, only_bulbs = false);

}

const off = (trans = 1000) => {

    return run_parallel((device) => {
        return device.power(false, trans);
    }, only_bulbs = false);

}

const run_parallel = (callback, only_bulbs = true) => {

    let promises = [];

    for( bulb of bulbs ) {
        promises.push( callback(bulb) );
    }
    
    if(!only_bulbs) {
        for( plug of plugs ) {
            promises.push( callback(plug) );
        }
    }

    return Promise.all(promises);

}

const get_state = () => {

    return run_parallel(
        bulb => bulb.info()
    ).then(
        states => states.reduce((acc, curr) => {
            acc[curr.alias] = curr.light_state;
            return acc;
        }, {}
    ));

}



module.exports = {
    get_state,
    set_bulbs,
    off,
    on
};
