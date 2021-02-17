const events = require('./events');
const lights_controller = require('../controllers/lights-controller');
const TPLSmartDevice = require('tplink-lightbulb');


const setup_lights_activity_event = () => {

    events.on('room_entered', () => {
        lights_controller.on();
    });

    events.on('room_empty', () => {
        lights_controller.off();
    });

};

module.exports = {
    setup_lights_activity_event
}

