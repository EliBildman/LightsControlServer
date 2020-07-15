const cron = require('node-schedule');
const ir_sensor = require('../controllers/ir_sensor_controller');

const sun = require('./sun');

/* 
events:
room_entered: after inactivety for n minuets, any activity in room (activity detected by ir sensor)
room_empty: inactivity in room for n minuets
sunrise
sunset
time: one time run at a Date
cron: repeating time defined by a cron string
lights_on: when any lights turn on
lights_off: when all lights are off
*/

const listeners = [];

const on = (event, callback) => {

    const listener = {
        event,
        callback,
        cancel: () => {
            listeners.splice( listeners.indexOf(this) );
        },
    }

    listeners.push(listener);
    return listener;

};

const run = (event) => {

    const on_event = listeners.filter(listener => listener.event === event);
    for( listener of on_event ) {
        listener.callback();
    }

};


module.exports = {
    on,
    run,
}