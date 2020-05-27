const defaults = require('defaults');
const join = require('path').join;
// const hex = require('rgb-hex');
const toRGB32 = require(join(__dirname, 'helpers')).rgb_to_rgb32;

const socket = (ws) => {

    let config = {};

    config.ws = ws;

    const handleConfigData = (message) => {

        console.log("NEW LIGHTS STRIP CONNECTED");

        let conn_data = JSON.parse(message);
        config.pipe = ws;
        config.length = conn_data.length;
        config.index = conn_data.index;

        //send confirmation
        ws.send("CONNECTED");

        ws.removeEventListener('message', handleConfigData);

    };

    //on getting config data
    ws.on('message', handleConfigData);

    //on end connection
    ws.on('close', () => {
        console.log('LIGHTS STRIP DISCONNECT');
    });

    config.send_state = (state) => {

        //should do some input checking here, it's bad if the arduino dies

        //colors: list of lists of length config.length
        //mode: static / run / loop / bounce

        for(let i = 0; i < state.colors.length; i++) {

            for(let j = 0; j < state.colors[i].length; j++) {
                state.colors[i][j] = toRGB32(state.colors[i][j]);
            }

        }

        ws.send(JSON.stringify(state));
    };

    return config;

};

module.exports = {
    socket
};