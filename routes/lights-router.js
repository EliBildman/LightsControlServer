const express = require('express');
const router = express.Router();
const join = require("path").join;
const fs = require("fs");

const controller = require(join(__dirname, '..', 'tools', 'lights-controller'));


router.post('/set-all', (req, res) => {

    if(!req.body.color) {
        res.status(400);
        return;
    }

    let color = [];
    for(c of req.body.color) color.push(parseInt(c));

    controller.setAll(color);

    res.end('OK');
    
});

router.post('/all-off', (req, res) => {
    controller.allOff();

    res.end('OK');
});


router.post('/manual-set', (req, res) => {

    if(!req.body.render) {
        res.status(400);
        res.end("NEED RENDER DATA");
        return;
    }

    if(req.body.render.length != controller.config.leds) {
        res.status(400);
        res.end(`RENDER MUST BE OF LENGTH ${controller.config.leds}`);
        return;
    }

    res.end("OK");
    
});

router.post('/cascade', (req, res) => {
    controller.cascadeOn(req.body.color);
    res.end('OK');
});

router.post('/random-ripple', (req, res) => {
    controller.randomRipple(req.body.color);
    res.end('OK')
});

router.post('/ping-pong', (req, res) => {
    controller.pingPong({ baseColor: req.body.color });
    res.end('OK')
});

router.ws('/connect', (ws, req) => {

    controller.connect_led(ws);

});



module.exports = router;