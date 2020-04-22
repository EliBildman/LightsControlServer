const join = require('path').join;
const leds = require('rpi-ws281x');
const TPapi = require('tplink-smarthome-api');
const fs = require('fs');
const RGBtoHSL = require('rgb-to-hsl');

const handleRuns = require(join(__dirname, 'runHandler'));

const state = {
    baseColor: [0, 0, 0],
    brightness: 0,
    routine: null,
    data: null
}


const led_config = JSON.parse(fs.readFileSync(join(__dirname, '..', 'public', 'data', 'leds-config.json')));

leds.configure(led_config);

const tplinkClient = new TPapi.Client();

let bulb;
tplinkClient.startDiscovery({macAddresses: ['AC84C67E9327']}).on('bulb-new', (device) => { 
    bulb = device; 
    // bulb.lighting.setLightState({on_off: false});
    tplinkClient.stopDiscovery(); 
});


const RGBtoRGB32 = (rgb) => {
    [red, green, blue] = rgb;
    return (red << 16) | (green) << 8 | blue;
}

const setBulb = (color) => {
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
}

const bulbOff = () => {
    return bulb.lighting.setLightState({
        on_off: false,
        transition_period: 0
    });
}

const setAllLeds = (color) => {
    return new Promise((res, rej) => {

        let conv = RGBtoRGB32(color);
        let pixels = new Uint32Array(led_config.leds);

        for(i in pixels) {
            pixels[i] = conv;
        }

        leds.render(pixels);

        res();
    })

}

const setLedsRGB32 = (colors) => {
    return new Promise((res, rej) => {
        leds.render(colors);
        res();
    });
}

const setLeds = (colors) => {

    if(colors.length != led_config.leds) throw `Length of colors must be ${led_config.leds}`;

    return new Promise((res, rej) => {
        let pixels = new Uint32Array(led_config.leds);
        
        for(i in pixels) {
            pixels[i] = RGBtoRGB32(colors[i]);
        }

        leds.render(pixels);
        res();

    });
}

const cascadeLeds = (speed, color) => {
    let currLed = 0;
    let numLeds = led_config.leds;
    let off32 = RGBtoRGB32([0, 0, 0]);
    let color32 = RGBtoRGB32(color);
    return new Promise((res, rej) => {
        state.routine = setInterval(() => {

            let pixels = new Uint32Array(led_config.leds);
            for(let i = 0; i < led_config.leds; i++) {
                if(i <= currLed) pixels[i] = color32;
                else pixels[i] = off32;
            }

            leds.render(pixels);

            currLed += 1;

            if(currLed >= numLeds) {
                clearInterval(state.routine);
                res();
            }
        }, 1000/speed);
    });
}




module.exports.setAll = (color, next) => {

    return setBulb(color)
    .then(() => { setAllLeds(color); });


}

module.exports.allOff = (next) => {

    return bulbOff()
    .then(() => setAllLeds([0, 0, 0]));

}

module.exports.cascadeOn = (color) => {

    module.exports.allOff()
    .then(() => cascadeLeds(50, color))
    .then(() => setBulb(color));

}