const join = require('path').join;
const socket_send = require('../tools/led-socket');
const states = require('../tools/led_states');
const defaults = require('defaults');


let strips = [];


const get_index = (i) => {
    return strips.filter(s => s.index === i);
};


const max_index = () => {
    return strips.reduce((acc, curr) => { return curr.index > acc ? curr.index : acc }, -1);
};


const new_strip = (ws) => {
    strips.push( socket_send.socket(ws) );
};


const off = () => {
    set_color([0, 0, 0]);
};


const set_color = (options) => {

    defaults(options, {
        subset: [0, max_index() + 1]
    });

    return run_parallel((strip) => {

        let state = {
            colors: [[]],
            mode: states.STATIC
        };
    
        for(let i = 0; i < strip.length; i++) {
            state.colors[0].push(options.color);
        }

        return strip.send_state(state);
    
    }, options.subset);

};


const run_sequence = (callback, subset) => {

    const run_ind = (i) => {

        if( i >= subset[1] ) return;

        const strips = get_index(i);
        let promises = [];

        for( strip of strips ) promises.push(callback(strip));

        return Promise.all(promises).then(() => run_ind(i + 1));

    }

    return run_ind(subset[0]);

}


const run_parallel = (callback, subset) => {

    let promises = [];

    for( let i = subset[0]; i < subset[1]; i++ ) {
        for( strip of get_index(i) ) promises.push( callback(strip) );
    }

    return Promise.all(promises);

}


const cascade_on = (options) => {

    //color (color touple): color to cascade into (required)
    //baseColor (color touple): color to cascade out of (deafult 0)
    //stripIndexes (List<number>): indexes of strips to turn on, cooresponds to strip index fields (deafult all)
    //subset ([start (inc), end (uninc)]): subset to use within each strip (deafult all)
    //delay (number): delay between ticks

    options = defaults(options, {
        baseColor: [0, 0, 0],
        subset: [0, max_index() + 1],
        strip_subset: [0, Number.MAX_VALUE],
        delay: 20
    });

    return run_sequence((strip) => {

        let state = {
            colors: [],
            mode: states.RUN,
            delay: options.delay
        };

        for( let j = 0; j < strip.length && j < options.strip_subset[1] - options.strip_subset[0]; j++ ) {

            state.colors.push([]);
        
            for( let diff = 0; diff < options.strip_subset[0]; diff++) state.colors[j].push(null);
                        
            for( let k = options.strip_subset[0]; k < strip.length && k < options.strip_subset[1]; k++ ) {
                state.colors[j].push( k <= j + options.strip_subset[0] ? options.color : options.baseColor );
            }
        
        }

        return strip.send_state(state);

    }, options.subset);

};


const ping_pong = (options) => {

    options = defaults(options, {

    });

}




module.exports = {
    strips,
    off,
    new_strip,
    set_color,
    cascade_on
}