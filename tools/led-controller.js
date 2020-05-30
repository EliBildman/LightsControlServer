const join = require('path').join;
const socket_send = require(join(__dirname, 'socket-send'));
const states = require(join(__dirname, 'led_states'));


let strips = [];


const new_strip = (ws) => {
    let strip = socket_send.socket(ws);;
    strips.splice(strip.index, 0, strip);
};


const off = () => {

    set_color([0, 0, 0]);

};


const set_color = (color) => {

    let promises = [];

    for(strip of strips) {

        let state = {
            colors: [[]],
            mode: states.STATIC
        };

        for(let i = 0; i < strip.length; i++) {
            state.colors[0].push(color);
        }

        promises.push(strip.send_state(state));

    }

    return Promise.all(promises);

};

//should write overloads that do specific indexes / subsets

const cascade_on = (color) => {

    const cascade_strip = (i) => {

        if(i >= strips.length) return;

        strip = strips[i];
    
        let state = {
            colors: [],
            mode: states.LOOP,
            delay: 50
        };

        for( let i = 0; i < strip.length; i++ ) {
            state.colors.push([]);
            for(let j = 0; j < strip.length; j++) {
                state.colors[i].push( j <= i ? color : [0, 0, 0] );
            }
        }

        return strip.send_state(state)
        .then(() => cascade_strip(i + 1));
    
    }

    return cascade_strip(0);

}


module.exports = {
    off,
    new_strip,
    set_color,
    cascade_on
}