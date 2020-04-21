const express = require('express');
const router = express.Router();
const lights = require('rpi-ws281x');
const io = require('onoff').Gpio;
const join = require("path").join;
const fs = require("fs");


let config = JSON.parse(fs.readFileSync(join(__dirname, '..', 'public', 'data', 'lights-config.json')));
lights.configure(config);



router.get('/get-config', (req, res) => {
    res.end(config);
});

router.get('/log', (req, res) => {
    console.log('got it!');
});



const getRGB32 = (rgb) => {
    [red, green, blue] = rgb;
    return (red << 16) | (green) << 8 | blue;
}

router.post('/manual-set', (req, res) => {

    console.log(req.body.render);

    if(!req.body.render) {
        res.status(400);
        res.end("NEED RENDER DATA");
        return;
    }

    if(req.body.render.length != config.leds) {
        res.status(400);
        res.end(`RENDER MUST BE OF LENGTH ${config.leds}`);
        return;
    }

    let pixels = new Uint32Array(config.leds);

    for(let i = 0; i < config.leds; i++) {
        pixels[i] = getRGB32(req.body.render[i]);
    }

    lights.render(pixels);

    res.end("OK");
    
});


module.exports = router;