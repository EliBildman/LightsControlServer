const express = require('express');
const router = express.Router();
const wol = require('wakeonlan');


router.post('/turn-on', (req, res) => {

    if(!req.body.mac) {
        res.status(400);
        res.end("NEED MAC OF COMPUTER TO BE TOGGLED");
        return;
    }

    wol(req.body.mac).then(() => { console.log(`Sent WOL Packet to ${req.body.mac}`); });

    res.status(200);
    res.end("SENDING");

});

router.post('/turn-off', (req, res) => {

});

module.exports = router;