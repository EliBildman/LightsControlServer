const events = require('./events');
const lights_controller = require('../controllers/lights-controller');
const TPLSmartDevice = require('tplink-lightbulb');

let temp_off = false;
let states = [];

const setup_lights_activity_event = () => {

    events.on('room_entered', () => {
        if(temp_off) {
            for(s of states) {
                if(s.on_off) {
                    lights_controller.turn_on({ name: s.name });
                }
            }
            temp_off = false;
        }
    });

    events.on('room_empty', () => {

        lights_controller.get_states().then((curr_states) => {
            console.log(curr_states)
            states = curr_states
            if(curr_states.find((s) => s.on_off)) {
                lights_controller.all_off();
                temp_off = true;
            }
        });

    });

};

module.exports = {
    setup_lights_activity_event
}

