const sun = require ('sunrise-sunset-js');
const schedule = require('node-schedule');
const events = require('./events');

const location = require('../configs/location-config.json');

const set_events = () => {

    schedule.scheduleJob(sun.getSunrise(location.lat, location.lon), () => { events.run('sunrise') });

    schedule.scheduleJob(sun.getSunset(location.lat, location.lon),() => { events.run('sunset') });

};

const setup_sun_event = () => {
    schedule.scheduleJob('0 0 0 * * *', (fire_date) => {
        set_events();
    });
    set_events();
};

module.exports = {
    setup_sun_event
};