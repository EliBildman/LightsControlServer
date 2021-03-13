const tpapi = require('tplink-lightbulb');
const device_configs = require('../configs/devices-config.json');

const plug_macs = device_configs.plugs.map(p => p.mac);
const bulb_macs = device_configs.smartlights.map(d => d.mac.replace(/:/g, ''));

const macs = plug_macs.concat(bulb_macs);

devices = {};

const is_done = () => {
    let s = 0;
    for(type in devices) s += devices[type].length;
    return s == macs.length;
}

const when_ready = [];

const devices_paired = new Promise((res, rej) => {

    const scan = tpapi.scan().on('light', device => {
    
        device.info().then((info) => {
    
            let found_mac;
            if(info.mic_mac) found_mac = info.mic_mac;
            if(info.mac) found_mac = info.mac;

            let plug_config = device_configs.plugs.find((p) => p.mac == found_mac);
    
            if( found_mac && macs.includes(found_mac) ) {
    
                if(!devices[info.mic_type]) devices[info.mic_type] = [];
    
                devices[info.mic_type].push({
                    device: device,
                    name: info.alias,
                    mac: found_mac,
                    type: info.mic_type
                });

                if(plug_config) devices[info.mic_type][ devices[info.mic_type].length - 1 ].function = plug_config.function;
    
                console.log(`Registered new smart-device: ${info.alias}`);
    
                if(is_done()) {
                    scan.stop();
                    res();
                }
    
            }
    
        });
    
    });

}).then(() => {
    for(callback of when_ready) callback();
});


module.exports = {
    devices,
    when_ready
}
