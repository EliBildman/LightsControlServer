const express = require('express');
const router = express.Router();

const controller = require('../controllers/toggle-controller');

router.post('/desktop', (req, res) => {

    if(!req.body.action || !['on', 'off', 'get'].includes(req.body.action) ) {
    
        res.status(400);
        res.end();
        return;

    }

    controller.desktop( req.body.action ).then((data) => {

        res.status(200);
        res.end(JSON.stringify(data));

    }).catch((err) => {

        console.log('Toggle Error:\n' + err)

        res.status(500);
        res.end(JSON.stringify(err));

    });

});

router.post('/ac', (req, res) => {

    if( !req.body.action || !['on', 'off', 'get'].includes(req.body.action) ) {
    
        res.status(400);
        res.end();
        return;

    }

    controller.ac( req.body.action ).then( (data) => {

        res.status(200);
        res.end(JSON.stringify(data));

    }).catch( (err) => {

        res.status(500);
        res.end(JSON.stringify(err));

    });

});


module.exports = router;
