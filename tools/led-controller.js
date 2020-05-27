const join = require('path').join;
const socket_send = require(join(__dirname, 'socket-send'));
const states = require(join(__dirname, 'led_states'));

let strips = [];


const new_strip = (ws) => {
    let strip = socket_send.socket(ws);;
    strips.splice(strip.index, 0, strip);
};


const set_color = (color) => {

    for(strip of strips) {

        let state = {
            colors: [[]],
            mode: states.STATIC
        };

        for(let i = 0; i < strip.length; i++) {
            state.colors[0].push(color);
        }

        strip.send_state(state);

    }

};


module.exports = {
    new_strip,
    set_color
}