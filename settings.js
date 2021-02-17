const events = require('./scheduling/events');
const sun = require('./scheduling/sun')

sun.start_sun_event()

events.on('room_entered', () => {
    console.log('room active');
});

events.on('room_empty', () => {
    console.log('room inactive');
});
