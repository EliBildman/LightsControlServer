const events = require('./events');
const lights_controller = require('../controllers/lights-controller');
const TPLSmartDevice = require('tplink-lightbulb');

let temp_off = false;

const setup_lights_activity_event = () => {

    events.on('room_entered', () => {
        if(temp_off) {
            lights_controller.on();
            temp_off = false;
        }
    });

    events.on('room_empty', () => {
        lights_controller.get_lights_on().then((is_on) => {
            if(is_on) {
                lights_controller.off();
                temp_off = true;
            }
        })
    });

};

module.exports = {
    setup_lights_activity_event
}

