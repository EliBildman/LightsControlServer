const events = require('./events');

const inactivity_delay = 5; //mins
let active;
let inactivity_timeout;

const inactive = () => {
    events.run('room_empty');
}

const set_active = () => {
    if(active) {
        clearTimeout(inactivity_timeout);
    } else {
        active = true;
        events.run('room_entered');
    }
    inactivity_timeout = setTimeout(inactive, inactivity_delay * 1000 * 60); //* 1000 ms/s * 60 s/min
}

module.exports = {
    set_active
}