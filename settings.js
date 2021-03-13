const events = require('./scheduling/events');
const sun = require('./scheduling/sun');
const lights = require('./scheduling/lights-auto-off');

sun.setup_sun_event();
lights.setup_lights_activity_event();



// let x = true;
// setInterval(() => {
//     if(x) {
//         events.run('room_entered');
//     } else {
//         events.run('room_empty');
//     }
//     x = !x;
// }, 5000);